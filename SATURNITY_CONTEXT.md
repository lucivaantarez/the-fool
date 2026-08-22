# Saturnity Vault v2.9 Project Context

## Purpose

Upgrade Saturnity Vault from v2.3 to v2.9.

Authority order:

1. handout.md = absolute behavior/spec authority
2. vault.json = absolute real data shape authority
3. index.html v2.3 = starting code only

If code conflicts with handout.md, handout.md wins.

---

# Critical Data Rule

vault[] is the single source of truth.

Every mutation:

modify vault[]
        |
        v
saveVault()
        |
        v
render()

Never maintain duplicate data copies.

---

# Preservation Requirements

Never delete, rename, or drop any field.

Root wrapper:

- version
- exported
- vault

Group fields:

- id
- name
- serverName
- createdAt
- pinned
- banned
- alternatives
- cookies
- changelog
- pc
- lastChecked

Cookie fields:

- username
- password
- cookie
- banStatus
- timeline
- tags
- id

Timeline:

- t
- type
- msg

Alternative:

- id
- label
- cookies

Changelog:

- t
- msg

Unknown future fields must survive:

load -> render -> edit -> save

Migration must be additive only.

---

# Storage

Required functions:

loadVault()
saveVault()
exportVault()
importVault()

Export wrapper:

{
 "version":1,
 "exported": timestamp,
 "vault":[]
}

---

# Current Development Status

Phase 1:
- migration foundation
- local storage
- save/load/export

Phase 2:
- vault renderer
- group creation
- splitter foundation

Phase 3:
- group detail
- cookie rendering

Phase 4:
- additive import merge

Phase 5:
- cookie/group detail views

---

# Next Development Tasks

## Phase 6

Implement:

### Editing

Group:
- name
- serverName
- pinned
- banned

Cookie:
- username
- password
- cookie
- banStatus
- tags

All edits must call saveVault().

---

## Timeline System

Every important mutation creates:

{
 "t": timestamp,
 "type": "event",
 "msg": "description"
}

---

# Splitter Module

Must support:

Input:
- paste text
- TXT
- JSON
- CSV

Output:

UPC:
username:password:cookie

UC:
cookie

UP:
username:password

Export:
- TXT
- JSON
- CSV

---

# Cookie Checker

Future API integration.

Flow:

cookie
 |
checker API
 |
result
 |
update banStatus
 |
append timeline
 |
saveVault()

---

# UI Direction

Use The Fool inspired style:

- dark operator dashboard
- sidebar navigation
- compact tables
- cards
- status badges
- activity logs
- SVG icons

---

# Coding Rules

Never:

- wipe vault.json
- replace data with simplified objects
- remove unknown properties
- rename fields
- create separate data source

Before major architecture changes, ask.

The goal is a production Saturnity Vault v2.9 application.
