-- Extract structured metadata from a loaded xmake `package` instance.
--
-- All public functions take a loaded `instance` and return plain Lua tables
-- that JSON-serialize cleanly. No I/O here — git/file lookups live elsewhere.

import("core.base.json")
import("core.base.semver")
import("core.platform.platform")
import("private.core.base.select_script")

-- Tag a Lua table so xmake's JSON encoder emits `[]` rather than `{}` when it
-- happens to be empty. Without this, the JS side trips on `for...of` over an
-- object — JS arrays and objects look identical in JSON when both are empty.
local function _array(t)
    return json.mark_as_array(t or {})
end

-- Platforms we report in supported_plats, in display order.
local PLATS = {"windows", "linux", "macosx", "iphoneos", "android", "mingw", "msys", "bsd", "wasm", "cross", "harmony"}

-- Forge hosts whose path conventions (/archive/, /releases/, /-/archive/) we
-- understand well enough to derive a repo root from a download URL.
local FORGE_HOSTS = {
    ["github.com"]    = true,
    ["gitlab.com"]    = true,
    ["bitbucket.org"] = true,
    ["codeberg.org"]  = true,
    ["gitea.com"]     = true,
    ["gitee.com"]     = true,
}

local function _is_git_url(url)
    if type(url) ~= "string" then return false end
    return url:find("^git%+") ~= nil or url:find("^git://") ~= nil or url:find("%.git$") ~= nil
end

local function _urls_list(instance)
    local urls = instance:get("urls")
    if not urls then return _array({}) end
    -- Never mutate xmake's internal data — copy before tagging as JSON array.
    local out = {}
    if type(urls) == "string" then
        table.insert(out, urls)
    else
        for _, u in ipairs(urls) do table.insert(out, u) end
    end
    return _array(out)
end

local function _normalize_repo_url(url)
    if type(url) ~= "string" then return nil end
    url = url:gsub("^git%+", "")
    local root = url:match("^(https?://[^/]+/[^/]+/[^/]+)/%-/archive/")
    if root then return root end
    root = url:match("^(https?://[^/]+/[^/]+/[^/]+)%.git$")
    if root then return root end
    local host = url:match("^https?://([^/]+)/")
    if host and FORGE_HOSTS[host] then
        root = url:match("^(https?://[^/]+/[^/]+/[^/]+)/archive/")
            or url:match("^(https?://[^/]+/[^/]+/[^/]+)/releases/")
            or url:match("^(https?://[^/]+/[^/]+/[^/]+)/get/")
        if root then return root end
    end
    return nil
end

local function _homepage_as_repo_url(homepage)
    if type(homepage) ~= "string" then return nil end
    local host, rest = homepage:match("^https?://([^/]+)/(.+)$")
    if not host or not FORGE_HOSTS[host] then return nil end
    local owner, repo = rest:match("^([^/]+)/([^/]+)/?$")
    if not owner or not repo then return nil end
    return ("https://%s/%s/%s"):format(host, owner, repo)
end

function repository_url(instance)
    for _, url in ipairs(_urls_list(instance)) do
        if _is_git_url(url) then
            return (url:gsub("^git%+", ""))
        end
    end
    for _, url in ipairs(_urls_list(instance)) do
        local repo = _normalize_repo_url(url)
        if repo then return repo end
    end
    return _homepage_as_repo_url(instance:get("homepage"))
end

local function _resolve_url(instance, url, version)
    if not url or not version then return nil end
    if not url:find("%$%(version%)") and not url:find("%$%(version_nodot%)") then
        return url
    end
    local effective = version
    local filter = instance:url_version(url)
    if filter then
        local arg = version
        try {
            function () arg = semver.new(version) end,
            catch { function () end }
        }
        arg = arg or version
        local result = filter(arg)
        if result ~= nil then effective = tostring(result) end
    end
    local repl = (effective:gsub("%%", "%%%%"))
    local resolved = url:gsub("%$%(version%)", repl)
    local repl_nodot = (effective:gsub("%.", ""):gsub("%%", "%%%%"))
    resolved = resolved:gsub("%$%(version_nodot%)", repl_nodot)
    return resolved
end

function download_url(instance, version)
    for _, url in ipairs(_urls_list(instance)) do
        if not _is_git_url(url) then
            return _resolve_url(instance, url, version)
        end
    end
    return nil
end

-- Returns the (deduped, sorted) list of versions for a package. The newest
-- version is `list[#list]`; we keep ascending order so callers can present
-- "latest <- N previous" trivially.
function versions_list(instance)
    local versions = instance:get("versions")
    if not versions or type(versions) ~= "table" then return _array({}) end
    local seen, list = {}, {}
    for v, _ in pairs(versions) do
        local key = tostring(v)
        local pos = key:find(":", 1, true)
        if pos then key = key:sub(pos + 1) end
        if key ~= "" and not seen[key] then
            seen[key] = true
            table.insert(list, key)
        end
    end
    table.sort(list, function(a, b)
        if semver.is_valid(a) and semver.is_valid(b) then
            return semver.compare(a, b) < 0
        end
        return a < b
    end)
    return _array(list)
end

-- Strip a leading "v" tag prefix on user-facing latest version (v1.3.1 -> 1.3.1).
-- Keep the raw tag separately so download URLs continue to resolve correctly.
local function _strip_v(v)
    if type(v) == "string" and v:match("^v%d") then
        return v:sub(2)
    end
    return v
end

-- Per-config metadata: description, default, type, values list.
function configs_table(instance)
    local names = instance:get("configs") or {}
    if type(names) ~= "table" then names = {names} end
    local extra = instance:extraconf("configs") or {}
    local out = {}
    for _, name in ipairs(names) do
        local e = extra[name] or {}
        local values = e.values
        if type(values) == "function" then values = nil end -- not JSON-serializable
        table.insert(out, {
            name        = name,
            description = e.description,
            default     = e.default,
            type        = e.type,
            values      = values,
        })
    end
    table.sort(out, function(a, b) return tostring(a.name) < tostring(b.name) end)
    return _array(out)
end

function deps_list(instance)
    local deps = instance:get("deps") or {}
    if type(deps) ~= "table" then deps = {deps} end
    local out = {}
    for _, d in ipairs(deps) do table.insert(out, tostring(d)) end
    table.sort(out)
    return _array(out)
end

function extsources_list(instance)
    local ext = instance:get("extsources") or {}
    if type(ext) ~= "table" then ext = {ext} end
    local out = {}
    for _, e in ipairs(ext) do table.insert(out, tostring(e)) end
    table.sort(out)
    return _array(out)
end

-- Returns a map { [plat] = {arch, arch, ...} } of platforms+archs the package
-- declares support for, by probing on_install/on_fetch with select_script.
function supported_platforms(instance)
    if instance:is_template() then return {} end
    local script = instance:get(instance:is_fetchonly() and "fetch" or "install")
    local out = {}
    for _, plat in ipairs(PLATS) do
        local archs = platform.archs(plat) or {}
        local supported = {}
        for _, arch in ipairs(archs) do
            if select_script(script, {plat = plat, arch = arch})
                or select_script(script, {plat = plat, arch = arch, subhost = plat, subarch = arch}) then
                table.insert(supported, arch)
            end
        end
        if #supported > 0 then
            out[plat] = _array(supported)
        end
    end
    return out
end

-- The first letter of the package name (xmake-repo's on-disk grouping). Useful
-- as a coarse category facet in the UI; not a semantic category.
function letter(instance)
    local n = instance:name() or ""
    local c = n:sub(1, 1):lower()
    if c:match("[a-z]") then return c end
    return "#"
end

-- Compose every reportable field for one package into a single table. The web
-- site treats this as the per-package detail document.
function detail(instance, opts)
    opts = opts or {}
    local versions = versions_list(instance)
    local latest_raw = versions[#versions]
    return {
        name           = instance:name(),
        alias          = instance:alias(),
        description    = instance:get("description"),
        homepage       = instance:get("homepage"),
        license        = instance:get("license"),
        kind           = instance:kind(),
        latest_version = _strip_v(latest_raw),
        latest_tag     = latest_raw,
        versions       = versions,
        urls           = _urls_list(instance),
        repository_url = repository_url(instance),
        download_url   = download_url(instance, latest_raw),
        configs        = configs_table(instance),
        deps           = deps_list(instance),
        extsources     = extsources_list(instance),
        platforms      = supported_platforms(instance),
        letter         = letter(instance),
        added_at       = opts.added_at,
        updated_at     = opts.updated_at,
    }
end

-- Subset of `detail` suitable for an all-packages listing. Keeps the index
-- payload small so the home/list pages stay snappy even with 2000+ entries.
function summary(d)
    local plats = {}
    for plat, _ in pairs(d.platforms or {}) do table.insert(plats, plat) end
    table.sort(plats)
    return {
        name           = d.name,
        description    = d.description,
        license        = d.license,
        latest_version = d.latest_version,
        letter         = d.letter,
        platforms      = _array(plats),
        added_at       = d.added_at,
        updated_at     = d.updated_at,
    }
end
