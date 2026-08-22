-- xmake l indexer/build.lua --repo=<path-to-xmake-repo> --out=<output-dir>
--
-- Walks an xmake-repo checkout, loads every package via the official loader,
-- and emits a static JSON dataset the Vue site consumes:
--
--   <out>/index.json            light summary list (everything visible on the listing page)
--   <out>/latest.json           recent additions + recent updates (home page feed)
--   <out>/stats.json            total counts, build timestamp, generator version
--   <out>/packages/<name>.json  per-package detail document
--   <out>/addons.json           light summary list of the addons
--   <out>/addons/<name>.json    per-addon detail document
--
-- xmake-repo keeps two kinds of recipe: the C/C++ packages under `packages/`
-- and the xmake addons (plugins, rules, toolchains, templates, modules) under
-- `addons/`. They are installed in completely different ways, so we index them
-- into their own datasets instead of mixing them in one list.
--
-- The web build copies <out>/ into web/public/data/.

import("core.base.json")
import("core.base.option")
import("core.package.package")
import("lib.package_info", {rootdir = os.scriptdir()})
import("lib.git_history",  {rootdir = os.scriptdir()})

local OPTIONS = {
    {nil, "repo", "kv", nil, "Path to a local xmake-repo checkout (default: ./xmake-repo)."},
    {nil, "out",  "kv", nil, "Output directory for generated JSON (default: ./dist/data)."},
    {nil, "latest_days", "kv", "7", "Window in days for the 'recently added/updated' lists."},
}

local function _load_package(packagename, packagedir, packagefile)
    local fi = debug.getinfo(package.load_from_repository)
    if fi and fi.nparams == 3 then -- xmake >= 2.7.8
        return package.load_from_repository(packagename, packagedir, {packagefile = packagefile})
    end
    return package.load_from_repository(packagename, nil, packagedir, packagefile)
end

local function _save_json(path, data)
    os.mkdir(path:match("(.*)/[^/]+$") or ".")
    json.savefile(path, data)
end

local function _within_days(iso, days)
    if type(iso) ~= "string" then return false end
    local y, m, d = iso:match("^(%d%d%d%d)-(%d%d)-(%d%d)")
    if not y then return false end
    local t = os.time({year = tonumber(y), month = tonumber(m), day = tonumber(d), hour = 0, min = 0, sec = 0})
    return (os.time() - t) <= days * 86400
end

-- Load every recipe under <repo>/<rootdir>/<letter>/<name>/xmake.lua and write
-- one detail document per recipe into <out>/<detaildir>/.
--
-- @param rootdir    the recipe root in the repo, e.g. "packages", "addons"
-- @param detaildir  the output subdirectory, e.g. "packages", "addons"
--
-- @return the summaries and the recipes we could not load
local function _scan(repo, rootdir, detaildir, out)
    local summaries, skipped = {}, {}
    local history = git_history.load(repo, rootdir)
    local detailsdir = path.join(out, detaildir)
    os.tryrm(detailsdir)
    os.mkdir(detailsdir)

    -- xmake's package loader resolves paths relative to cwd, so we operate
    -- from inside the repo checkout the same way scripts/build_index.lua does.
    local oldir = os.cd(repo)
    for _, packagedir in ipairs(os.dirs(path.join(rootdir, "*", "*"))) do
        local packagename = path.filename(packagedir)
        local packagefile = path.join(packagedir, "xmake.lua")
        -- The on-disk letter is what `git log` saw; package_info.letter() returns
        -- the *display* letter (digits collapse to "#"), which doesn't round-trip
        -- back into the git-history index. Always key off the directory name.
        local disk_letter = path.filename(path.directory(packagedir))
        try {
            function ()
                local inst = _load_package(packagename, packagedir, packagefile)
                if not inst or inst:is_template() then return end
                local times = git_history.times_for(history, disk_letter, packagename)
                local opts = {
                    added_at       = times.added_at,
                    updated_at     = times.updated_at,
                    package_source = io.readfile(packagefile),
                }
                local d = package_info.detail(inst, opts)
                _save_json(path.join(detailsdir, packagename .. ".json"), d)
                table.insert(summaries, package_info.summary(d))
            end,
            catch {
                function (errors)
                    table.insert(skipped, {name = packagename, error = tostring(errors)})
                end
            }
        }
    end
    os.cd(oldir)

    table.sort(summaries, function(a, b) return a.name < b.name end)
    return summaries, skipped
end

function main(...)
    local args = option.parse({...}, OPTIONS, "Build the xmake-packages-index JSON dataset.")
    local repo = args.repo or path.absolute("xmake-repo")
    local out  = args.out  or path.absolute("dist/data")
    local latest_days = tonumber(args.latest_days) or 7

    assert(os.isdir(repo), "repo dir not found: " .. repo)
    cprint("${dim}repo:${clear} %s", repo)
    cprint("${dim}out: ${clear} %s", out)

    cprint("${blue}>${clear} loading packages...")
    local summaries, skipped = _scan(repo, "packages", "packages", out)

    -- the addons are optional, an older xmake-repo checkout has no `addons/` yet
    local addons, addons_skipped = {}, {}
    if os.isdir(path.join(repo, "addons")) then
        cprint("${blue}>${clear} loading addons...")
        addons, addons_skipped = _scan(repo, "addons", "addons", out)
    end

    -- index.json: full list, used by /packages and search.
    _save_json(path.join(out, "index.json"), {
        generated_at = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        count        = #summaries,
        packages     = summaries,
    })

    -- addons.json: the same shape, used by /addons and its search.
    _save_json(path.join(out, "addons.json"), {
        generated_at = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        count        = #addons,
        addons       = json.mark_as_array(addons),
    })

    -- latest.json: home-page feed. Two buckets, since "added" is rare and
    -- "updated" is noisy — surfacing both helps users notice new packages.
    --
    -- @note the addons are part of the feed too, a summary carries its kind,
    -- so the listing links to the right detail page.
    local added, updated = {}, {}
    for _, s in ipairs(table.join(summaries, addons)) do
        if _within_days(s.added_at, latest_days) then table.insert(added, s) end
        if _within_days(s.updated_at, latest_days) and not _within_days(s.added_at, latest_days) then
            table.insert(updated, s)
        end
    end
    local function _desc_by(field)
        return function(a, b) return (a[field] or "") > (b[field] or "") end
    end
    table.sort(added,   _desc_by("added_at"))
    table.sort(updated, _desc_by("updated_at"))
    _save_json(path.join(out, "latest.json"), {
        generated_at = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        window_days  = latest_days,
        added        = json.mark_as_array(added),
        updated      = json.mark_as_array(updated),
    })

    -- stats.json: cheap to load on home page; avoids fetching index.json just
    -- to display a total-count chip.
    _save_json(path.join(out, "stats.json"), {
        generated_at = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        total        = #summaries,
        addons       = #addons,
        skipped      = #skipped + #addons_skipped,
    })

    cprint("${green}done${clear} %d packages, %d addons, %d skipped -> %s",
        #summaries, #addons, #skipped + #addons_skipped, out)
    for _, s in ipairs(table.join(skipped, addons_skipped)) do
        cprint("  ${yellow}skip${clear} %s: %s", s.name, s.error)
    end
end
