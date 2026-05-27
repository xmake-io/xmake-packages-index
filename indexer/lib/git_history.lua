-- Resolve added/updated timestamps for each package via `git log`.
--
-- A single `git log --name-only` pass over the whole repo is O(commits) once;
-- we then bucket commits to their packages. This is roughly 100x faster than
-- running `git log` per package directory on a repo with 2000+ packages.

-- Find the package directory a changed path belongs to. xmake-repo's modern
-- layout is `packages/<letter>/<name>/...`; historically it was also
-- `packages/<owner>/<name>/...` (e.g. packages/tboox/tbox/...) and bare
-- `<name>/<version>/...`. We only key off the modern layout — older commits
-- still register against the current path as soon as the package is renamed
-- or moved into place, which is what we want for "first appeared" semantics.
local function _pkg_key(filepath)
    local letter, name = filepath:match("^packages/([^/]+)/([^/]+)/")
    if not letter or not name then return nil end
    return letter .. "/" .. name
end

-- Walk `git log --name-only --reverse --format=COMMIT %aI` output and build:
--   added[key]   = ISO date of the commit that first touched packages/<key>/
--   updated[key] = ISO date of the most recent commit touching packages/<key>/
--
-- We use os.iorunv so xmake captures both stdout/stderr correctly and raises
-- a structured error if git is missing rather than producing silent partials.
function load(repodir)
    local added, updated = {}, {}
    local oldir = os.cd(repodir)
    local raw
    try {
        function ()
            raw = os.iorunv("git", {
                "log", "--reverse", "--name-only", "--no-merges",
                "--format=COMMIT %aI", "--", "packages/",
            })
        end,
        catch {
            function (errors)
                cprint("${yellow}warn${clear} git log failed: %s", tostring(errors))
                raw = ""
            end
        }
    }
    os.cd(oldir)
    local current_date
    for line in (raw or ""):gmatch("[^\n]+") do
        local d = line:match("^COMMIT (.+)$")
        if d then
            current_date = d
        elseif current_date then
            local key = _pkg_key(line)
            if key then
                if not added[key] then added[key] = current_date end
                updated[key] = current_date
            end
        end
    end
    return {added = added, updated = updated}
end

-- Lookup helper: history:times_for("z/zlib") -> {added_at = ..., updated_at = ...}
function times_for(history, letter, name)
    local key = letter:lower() .. "/" .. name:lower()
    return {
        added_at   = history.added[key],
        updated_at = history.updated[key],
    }
end
