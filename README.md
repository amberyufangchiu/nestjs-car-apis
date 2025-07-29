# 🧠 Learning Diary

**📅 Date:** 2025-07-11
**📘 Topic:** JWT

##### ✅ What I Learned Today

- env file managemment

- authentication: figure out WHO is making a request
- authorization: figureout if the person making the request is allowed to make it

##### 🔍 Concepts to Dive Into

---

**📅 Date:** 2025-07-03
**📘 Topic:** JWT

##### ✅ What I Learned Today

- JWT and passport.js Implementation
- token signAsync (better for non-blocking)

##### 🔍 Concepts to Dive Into

- docker
- postgresql

---

**📅 Date:** 2025-07-02
**📘 Topic:** authentication

##### ✅ What I Learned Today

- guard

- custom decorators (can’t access to instance, also means can’t access database)
- needs to build with interceptor for database access

- trying to understand trailwatch backend

##### 🔍 Concepts to Dive Into

- JWT Implementation
- CSRF and related security

---

**📅 Date:** 2025-06-28, 2025-06-30
**📘 Topic:** CRUD

##### ✅ What I Learned Today

- request -> validationPipe -> controller -> service -> repo
- learn how to make CRUD apis
- build interceptor
- authentication (sign up flow - salted and hashed password)

##### ❓ Some Questions I Need to Ask

- What authentication method should we use for the project (e.g., JWT, sessions, salted hashes), and how should we choose?

##### 🔍 Concepts to Dive Into

- Needs to dive in “exceptions filter”

---

**📅 Date:** 2025-06-27
**📘 Topic:** Set Up NestJS

##### ✅ What I Learned Today

- cli set up / generate files
- relationship between module/controller/service/repository
- typeORM set up
- DTO for type validation
- share Module between them
- TypeOrmModule.forRoot 1. synchronize 2. whitelist

##### ❓ Some Questions I Need to Ask

- why Jerry use Fastify instead of Express?

| You prefer                 | Choose      |
| -------------------------- | ----------- |
| 🔁 Simplicity & popularity | **Express** |
| ⚡ Speed & structure       | **Fastify** |

- how to choose right DB?

##### 🔍 Concepts to Dive Into

- Injectable()
- Dependency Injection (inversion controller)
