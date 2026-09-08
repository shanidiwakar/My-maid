--
-- PostgreSQL database dump
--

\restrict qADttLSbu8B2lJqanMUGvGcewcytjlA5vDHCzzHacsVFBNCasdHCHVJ04bysps6

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AddressType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AddressType" AS ENUM (
    'HOME',
    'OFFICE',
    'OTHER'
);


ALTER TYPE public."AddressType" OWNER TO postgres;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PARTNER_ASSIGNED',
    'PARTNER_ARRIVING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."BookingStatus" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: OtpPurpose; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OtpPurpose" AS ENUM (
    'LOGIN',
    'REGISTER',
    'RESET_PASSWORD'
);


ALTER TYPE public."OtpPurpose" OWNER TO postgres;

--
-- Name: PartnerAvailability; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartnerAvailability" AS ENUM (
    'OFFLINE',
    'AVAILABLE',
    'BUSY'
);


ALTER TYPE public."PartnerAvailability" OWNER TO postgres;

--
-- Name: PartnerStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartnerStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'REJECTED'
);


ALTER TYPE public."PartnerStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'PARTNER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "cityId" text NOT NULL,
    "serviceAreaId" text NOT NULL,
    type public."AddressType" NOT NULL,
    label text,
    "houseNumber" text NOT NULL,
    "buildingName" text,
    landmark text,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    pincode text NOT NULL,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: AppConfiguration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AppConfiguration" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AppConfiguration" OWNER TO postgres;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "bookingNumber" text NOT NULL,
    "userId" text NOT NULL,
    "serviceId" text NOT NULL,
    "addressId" text NOT NULL,
    "partnerId" text,
    "bookingDate" timestamp(3) without time zone NOT NULL,
    "slotStart" timestamp(3) without time zone NOT NULL,
    "slotEnd" timestamp(3) without time zone NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "serviceName" text NOT NULL,
    "serviceDuration" integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    "finalAmount" numeric(10,2) NOT NULL,
    "houseNumber" text NOT NULL,
    "buildingName" text,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    landmark text,
    "cityName" text NOT NULL,
    "serviceAreaName" text NOT NULL,
    pincode text NOT NULL,
    notes text,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    "cancelledReason" text,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Booking" OWNER TO postgres;

--
-- Name: City; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."City" (
    id text NOT NULL,
    name text NOT NULL,
    state text NOT NULL,
    country text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."City" OWNER TO postgres;

--
-- Name: OtpVerification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OtpVerification" (
    id text NOT NULL,
    phone text NOT NULL,
    otp text NOT NULL,
    purpose public."OtpPurpose" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OtpVerification" OWNER TO postgres;

--
-- Name: Partner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Partner" (
    id text NOT NULL,
    "userId" text NOT NULL,
    experience integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    "totalJobs" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    status public."PartnerStatus" DEFAULT 'PENDING'::public."PartnerStatus" NOT NULL,
    availability public."PartnerAvailability" DEFAULT 'OFFLINE'::public."PartnerAvailability" NOT NULL,
    "cityId" text NOT NULL,
    "serviceAreaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Partner" OWNER TO postgres;

--
-- Name: PartnerService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PartnerService" (
    "partnerId" text NOT NULL,
    "serviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PartnerService" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "deviceId" text,
    "deviceName" text,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "basePrice" numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO postgres;

--
-- Name: ServiceArea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ServiceArea" (
    id text NOT NULL,
    "cityId" text NOT NULL,
    name text NOT NULL,
    pincode text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceArea" OWNER TO postgres;

--
-- Name: ServiceCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ServiceCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    image text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceCategory" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    phone text NOT NULL,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text,
    email text,
    gender public."Gender",
    dob timestamp(3) without time zone,
    avatar text,
    language text DEFAULT 'en'::text NOT NULL,
    "referralCode" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserProfile" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", "cityId", "serviceAreaId", type, label, "houseNumber", "buildingName", landmark, "addressLine1", "addressLine2", pincode, latitude, longitude, "isDefault", "createdAt", "updatedAt") FROM stdin;
cmsd395800005ot01hublbrok	cmscu7wgs0001r0kcpzm4kq98	cmsbx1xl90000bptlda1g0gnj	cmsbx1xlk0002bptl6skm1jsa	HOME	\N	12A	Sky Heights	\N	Vijay Nagar	\N	452010	22.7533000	75.8937000	t	2026-08-03 10:30:41.328	2026-08-03 10:30:41.328
cmslkhapi00067l9l7w0m621d	cmslkbtv300017l9l7hazqjzg	cmsbx1xli0001bptlvu7vbjpr	cmsbx1xlk0005bptlhx6uou2d	HOME	\N	12A	Sky Heights	\N	Vijay Nagar	\N	452010	22.7533000	75.8937000	t	2026-08-09 08:55:04.566	2026-08-09 08:55:04.566
\.


--
-- Data for Name: AppConfiguration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AppConfiguration" (id, key, value, description, "updatedAt") FROM stdin;
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Booking" (id, "bookingNumber", "userId", "serviceId", "addressId", "partnerId", "bookingDate", "slotStart", "slotEnd", quantity, "serviceName", "serviceDuration", "unitPrice", "totalPrice", discount, "finalAmount", "houseNumber", "buildingName", "addressLine1", "addressLine2", landmark, "cityName", "serviceAreaName", pincode, notes, status, "cancelledReason", "completedAt", "createdAt", "updatedAt") FROM stdin;
cmsfr4s4i0004yk24xtdldeel	MM202608050001	cmscu7wgs0001r0kcpzm4kq98	cmse93xnr000914b4tgadk615	cmsd395800005ot01hublbrok	\N	2026-08-06 00:00:00	2026-08-06 09:00:00	2026-08-06 11:00:00	2	Home Cleaning	180	599.00	1198.00	0.00	1198.00	12A	Sky Heights	Vijay Nagar	\N	\N	Indore	Vijay Nagar	452010	Please ring the doorbell.	PENDING	\N	\N	2026-08-05 07:14:40.866	2026-08-05 07:14:40.866
cmslkkmg700087l9l6x370llr	MM202608090001	cmslkbtv300017l9l7hazqjzg	cmse93xnr000c14b450hv7586	cmslkhapi00067l9l7w0m621d	\N	2026-08-15 00:00:00	2026-08-15 09:00:00	2026-08-15 11:00:00	1	Fan Installation	60	499.00	499.00	0.00	499.00	12A	Sky Heights	Vijay Nagar	\N	\N	Bhopal	Arera Colony	452010	\N	PENDING	\N	\N	2026-08-09 08:57:39.751	2026-08-09 08:57:39.751
\.


--
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."City" (id, name, state, country, "isActive", "createdAt", "updatedAt") FROM stdin;
cmsbx1xl90000bptlda1g0gnj	Indore	Madhya Pradesh	India	t	2026-08-02 14:49:20.973	2026-08-02 14:49:20.973
cmsbx1xli0001bptlvu7vbjpr	Bhopal	Madhya Pradesh	India	t	2026-08-02 14:49:20.982	2026-08-02 14:49:20.982
\.


--
-- Data for Name: OtpVerification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OtpVerification" (id, phone, otp, purpose, "expiresAt", "verifiedAt", attempts, "createdAt") FROM stdin;
cmscu7iey0000r0kcjtdhltwn	9876543210	123456	LOGIN	2026-08-03 06:19:28.52	2026-08-03 06:17:46.764	0	2026-08-03 06:17:28.541
cmscuwy910000ray0c1jyiki4	9876543210	123456	LOGIN	2026-08-03 06:39:15.489	2026-08-03 06:37:18.679	0	2026-08-03 06:37:15.49
cmscuzfb60003ray0ay4v5ddx	9876543210	123456	LOGIN	2026-08-03 06:41:10.826	2026-08-03 06:39:20.35	0	2026-08-03 06:39:10.892
cmsd19qll0000ot011onmrdj7	9876543210	123456	LOGIN	2026-08-03 09:37:09.759	2026-08-03 09:35:27.616	0	2026-08-03 09:35:09.777
cmsfr3rg80000yk24sxttat84	9876543210	123456	LOGIN	2026-08-05 07:15:53.332	2026-08-05 07:14:10.987	0	2026-08-05 07:13:53.333
cmsfrogim000012fr57i1thdp	9876543210	123456	LOGIN	2026-08-05 07:31:58.914	2026-08-05 07:30:22.8	0	2026-08-05 07:29:58.928
cmsfvi64e00001auyai5eeqha	9876543210	123456	LOGIN	2026-08-05 09:19:03.911	2026-08-05 09:17:25.734	0	2026-08-05 09:17:03.961
cmsh4738h000066eu5gbodhcs	9876543210	123456	LOGIN	2026-08-06 06:10:09.742	2026-08-06 06:08:24.497	0	2026-08-06 06:08:09.75
cmsh47ope000366eul6a4yze6	9876543211	123456	LOGIN	2026-08-06 06:10:37.583	2026-08-06 06:08:43.068	0	2026-08-06 06:08:37.584
cmsk5stwv0000thgg65e7rfwn	9876543210	123456	LOGIN	2026-08-08 09:18:22.196	2026-08-08 09:16:37.037	0	2026-08-08 09:16:22.227
cmslkbf4000007l9lymuoh0p1	9000000001	123456	LOGIN	2026-08-09 08:52:30.281	2026-08-09 08:50:49.445	0	2026-08-09 08:50:30.309
cmslky8z600097l9lfc9oo57k	9000000002	123456	LOGIN	2026-08-09 09:10:15.417	2026-08-09 09:08:23.809	0	2026-08-09 09:08:15.445
cmsmttsva00001mxtgerf2yn0	9876598765	123456	LOGIN	2026-08-10 06:06:30.625	2026-08-10 06:04:52.369	0	2026-08-10 06:04:30.652
cmsmueg280000e1ggm4vozrfx	9876598765	123456	LOGIN	2026-08-10 06:22:33.871	2026-08-10 06:20:36.798	0	2026-08-10 06:20:33.873
cmsmviyv20000tvw7hpxw1tqj	9000000002	123456	LOGIN	2026-08-10 06:54:04.414	2026-08-10 06:52:22.849	0	2026-08-10 06:52:04.447
cmsmvk5rr0003tvw7e614a6o6	9000000002	123456	LOGIN	2026-08-10 06:55:00.087	2026-08-10 06:53:04.57	0	2026-08-10 06:53:00.088
cmsmvlssy0006tvw7q2vzpbil	9000000002	123456	LOGIN	2026-08-10 06:56:16.594	2026-08-10 06:54:20.245	0	2026-08-10 06:54:16.595
cmsmwyhma0000pg5kk20s9qva	9876543211	123456	LOGIN	2026-08-10 07:34:08.184	2026-08-10 07:32:21.845	0	2026-08-10 07:32:08.211
cmsmx3qrj0003pg5khaidt6t6	9876543211	123456	LOGIN	2026-08-10 07:38:13.372	2026-08-10 07:36:16.549	0	2026-08-10 07:36:13.375
cmsmx4sas0006pg5k6frpx348	9876543211	123456	LOGIN	2026-08-10 07:39:02	2026-08-10 07:37:05.881	0	2026-08-10 07:37:02.001
cmsmx6yjc000cpg5klb79c3v2	9876598765	123456	LOGIN	2026-08-10 07:40:43.413	2026-08-10 07:38:56.964	0	2026-08-10 07:38:43.415
cmsmx93pe000gpg5ku30bh0iq	9876543211	123456	LOGIN	2026-08-10 07:42:23.415	2026-08-10 07:40:33.591	0	2026-08-10 07:40:23.417
\.


--
-- Data for Name: Partner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Partner" (id, "userId", experience, rating, "totalJobs", "isVerified", status, availability, "cityId", "serviceAreaId", "createdAt", "updatedAt") FROM stdin;
cmsmx5699000bpg5kwhsud1z1	cmsmx4va60007pg5ks1l3xfbz	3	0.00	0	t	ACTIVE	AVAILABLE	cmsbx1xl90000bptlda1g0gnj	cmsmuap050004owgskx9x797b	2026-08-10 07:37:20.109	2026-08-10 07:42:53.511
\.


--
-- Data for Name: PartnerService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PartnerService" ("partnerId", "serviceId", "createdAt") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "userId", token, "expiresAt", "deviceId", "deviceName", "ipAddress", "createdAt", "updatedAt", "revokedAt") FROM stdin;
cmscu7wh20003r0kcklgr97ul	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1NzM3ODY2LCJleHAiOjE3ODgzMjk4NjZ9.R19D_JYoVvUEFsp_NIHqyVVeZ1B5Apphq1rkK-kPu4I	2026-09-02 06:17:46.79	\N	\N	\N	2026-08-03 06:17:46.79	2026-08-03 06:17:46.79	\N
cmscux0q20002ray0d1r7gwz7	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1NzM5MDM4LCJleHAiOjE3ODgzMzEwMzh9.ay5mhL_bOJ6rHxxpoq8HW9ZnI8cDWUgG1A8Lqc6XDFo	2026-09-02 06:37:18.698	\N	\N	\N	2026-08-03 06:37:18.699	2026-08-03 06:37:18.699	\N
cmscuzmln0005ray0e0wfef5r	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1NzM5MTYwLCJleHAiOjE3ODgzMzExNjB9.Qel_w7cuQvvnOIh6Y82FsQG-VeqhXcHhD7A3ql9V-ck	2026-09-02 06:39:20.363	\N	\N	\N	2026-08-03 06:39:20.364	2026-08-03 06:39:20.364	\N
cmsd1a4d60002ot01o457fx7t	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1NzQ5NzI3LCJleHAiOjE3ODgzNDE3Mjd9.iE7bENqLuQtXyBYMPLe1LVNMjgWevJHlKG5-0rMBSxw	2026-09-02 09:35:27.641	\N	\N	\N	2026-08-03 09:35:27.642	2026-08-03 09:35:27.642	\N
cmsfr453c0002yk24e14tchnl	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1OTE0MDUxLCJleHAiOjE3ODg1MDYwNTF9.jLTvGquPvjBoDD6bH2TM7Xk_cLAFNcGq_14_CWIqhLY	2026-09-04 07:14:11.015	\N	\N	\N	2026-08-05 07:14:11.016	2026-08-05 07:14:11.016	\N
cmsfroyxx000212frpeo4o6fm	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1OTE1MDIyLCJleHAiOjE3ODg1MDcwMjJ9.hmly29gO67IhbqCY_3NKsDN_1etblDOhEjZE-n17YKY	2026-09-04 07:30:22.821	\N	\N	\N	2026-08-05 07:30:22.821	2026-08-05 07:30:22.821	\N
cmsfvimx300021auyfkunxdjz	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1OTIxNDQ1LCJleHAiOjE3ODg1MTM0NDV9.FK8ZpaSwB_sXDvctCrcvmqOQHFqnRs3J0a9e58q7VKM	2026-09-04 09:17:25.766	\N	\N	\N	2026-08-05 09:17:25.767	2026-08-05 09:17:25.767	\N
cmsh47emk000266euhnedmcbt	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg1OTk2NTA0LCJleHAiOjE3ODg1ODg1MDR9.ufQUi1cZvOx_zRfAFjLFrKpPn85EtkBWAwu6JkgrWFE	2026-09-05 06:08:24.523	\N	\N	\N	2026-08-06 06:08:24.524	2026-08-06 06:08:24.524	\N
cmsk5t5c80002thggd9eaxdaw	cmscu7wgs0001r0kcpzm4kq98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNjdTd3Z3MwMDAxcjBrY3B6bTRrcTk4IiwicGhvbmUiOiI5ODc2NTQzMjEwIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MTgwNTk3LCJleHAiOjE3ODg3NzI1OTd9.z-Mj5H8UxvBRLEp5pM581mahexjOkj-mcG9yEx5DxzE	2026-09-07 09:16:37.063	\N	\N	\N	2026-08-08 09:16:37.064	2026-08-08 09:16:37.064	\N
cmslkbtvf00037l9l85v4a6l6	cmslkbtv300017l9l7hazqjzg	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNsa2J0djMwMDAxN2w5bDdoYXpxanpnIiwicGhvbmUiOiI5MDAwMDAwMDAxIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MjY1NDQ5LCJleHAiOjE3ODg4NTc0NDl9.efFaYXOnZPooJMuNwxeUabG1LkPiDEHM86QjgVRKz-U	2026-09-08 08:50:49.467	\N	\N	\N	2026-08-09 08:50:49.468	2026-08-09 08:50:49.468	\N
cmslkyffa000c7l9lfqm9bz00	cmslkyfey000a7l9lpbfzeuo4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNsa3lmZXkwMDBhN2w5bHBiZnpldW80IiwicGhvbmUiOiI5MDAwMDAwMDAyIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MjY2NTAzLCJleHAiOjE3ODg4NTg1MDN9.LafNHi9S6g8s2ea3QJ1nZVn1xz24xfcHWmokA24VLNc	2026-09-08 09:08:23.83	\N	\N	\N	2026-08-09 09:08:23.83	2026-08-09 09:08:23.83	\N
cmsmtu9m100031mxtskl9j2am	cmsmtu9lo00011mxt76rbm8w2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNtdHU5bG8wMDAxMW14dDc2cmJtOHcyIiwicGhvbmUiOiI5ODc2NTk4NzY1Iiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MzQxODkyLCJleHAiOjE3ODg5MzM4OTJ9.Jmwf92_1dqc2n1s9032jjgqDRcO8DobU7d1Jyov0fF8	2026-09-09 06:04:52.393	\N	\N	\N	2026-08-10 06:04:52.393	2026-08-10 06:04:52.393	\N
cmsmueic90002e1gg7636p7bd	cmsmtu9lo00011mxt76rbm8w2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNtdHU5bG8wMDAxMW14dDc2cmJtOHcyIiwicGhvbmUiOiI5ODc2NTk4NzY1Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzg2MzQyODM2LCJleHAiOjE3ODg5MzQ4MzZ9.7FstFS4odFVHuXdG_vcOBqHkC2O_BoMb6fxxpGlCK1A	2026-09-09 06:20:36.824	\N	\N	\N	2026-08-10 06:20:36.825	2026-08-10 06:20:36.825	\N
cmsmvjd210002tvw7u44wotiy	cmslkyfey000a7l9lpbfzeuo4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNsa3lmZXkwMDBhN2w5bHBiZnpldW80IiwicGhvbmUiOiI5MDAwMDAwMDAyIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MzQ0NzQyLCJleHAiOjE3ODg5MzY3NDJ9.Jk4MLNDpmQtB_MuRS_x7lP7xWoM8yzUjEG1yeX8Q_5Y	2026-09-09 06:52:22.872	\N	\N	\N	2026-08-10 06:52:22.873	2026-08-10 06:52:22.873	\N
cmsmvk98n0005tvw7bn9385hq	cmslkyfey000a7l9lpbfzeuo4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNsa3lmZXkwMDBhN2w5bHBiZnpldW80IiwicGhvbmUiOiI5MDAwMDAwMDAyIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MzQ0Nzg0LCJleHAiOjE3ODg5MzY3ODR9.f_1kopM7OWvsEAVwbcUtJfeus_VR6acUWwslfKWAWGE	2026-09-09 06:53:04.582	\N	\N	\N	2026-08-10 06:53:04.583	2026-08-10 06:53:04.583	\N
cmsmvlvmq0008tvw7atf1nm1o	cmslkyfey000a7l9lpbfzeuo4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNsa3lmZXkwMDBhN2w5bHBiZnpldW80IiwicGhvbmUiOiI5MDAwMDAwMDAyIiwicm9sZSI6IlBBUlRORVIiLCJpYXQiOjE3ODYzNDQ4NjAsImV4cCI6MTc4ODkzNjg2MH0.b5KJmyj1iBTOG5H86NrjgkJ3Feybbcv1Rkl2rqJ9aCI	2026-09-09 06:54:20.257	\N	\N	\N	2026-08-10 06:54:20.258	2026-08-10 06:54:20.258	\N
cmsmx4vad0009pg5kt2lby8wa	cmsmx4va60007pg5ks1l3xfbz	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNteDR2YTYwMDA3cGc1a3MxbDN4ZmJ6IiwicGhvbmUiOiI5ODc2NTQzMjExIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzg2MzQ3NDI1LCJleHAiOjE3ODg5Mzk0MjV9.XTNi18so79b6VjYdVm7Njt_a6Hyj1EVUk7DsbULKyvo	2026-09-09 07:37:05.892	\N	\N	\N	2026-08-10 07:37:05.893	2026-08-10 07:37:05.893	\N
cmsmx790b000epg5kcwd6alk8	cmsmtu9lo00011mxt76rbm8w2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNtdHU5bG8wMDAxMW14dDc2cmJtOHcyIiwicGhvbmUiOiI5ODc2NTk4NzY1Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzg2MzQ3NTM2LCJleHAiOjE3ODg5Mzk1MzZ9.4vlsIK1U_S-MFEtJ87Y6T4lvnEZL2oIbsfFuGSUguks	2026-09-09 07:38:56.987	\N	\N	\N	2026-08-10 07:38:56.987	2026-08-10 07:38:56.987	\N
cmsmx9bk4000ipg5k9g54zqnh	cmsmx4va60007pg5ks1l3xfbz	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXNteDR2YTYwMDA3cGc1a3MxbDN4ZmJ6IiwicGhvbmUiOiI5ODc2NTQzMjExIiwicm9sZSI6IlBBUlRORVIiLCJpYXQiOjE3ODYzNDc2MzMsImV4cCI6MTc4ODkzOTYzM30.oxaZqptF1gKi8d88boVKs8ReGCpDUbSSO_kHdZpZPa0	2026-09-09 07:40:33.604	\N	\N	\N	2026-08-10 07:40:33.605	2026-08-10 07:40:33.605	\N
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Service" (id, "categoryId", name, slug, description, image, "basePrice", duration, rating, "reviewCount", "isActive", "createdAt", "updatedAt") FROM stdin;
cmse93xnr000914b4tgadk615	cmse93xnn000614b4tn98x5q7	Home Cleaning	home-cleaning	\N	\N	599.00	180	0	0	t	2026-08-04 06:02:22.119	2026-08-10 06:17:38.844
cmse93xnr000a14b4kcgwgu3p	cmse93xnn000614b4tn98x5q7	Kitchen Cleaning	kitchen-cleaning	\N	\N	799.00	120	0	0	t	2026-08-04 06:02:22.119	2026-08-10 06:17:38.847
cmse93xnr000b14b4nwttffdt	cmse93xnp000714b4zol0c37n	Tap Repair	tap-repair	\N	\N	299.00	45	0	0	t	2026-08-04 06:02:22.119	2026-08-10 06:17:38.848
cmse93xnr000c14b450hv7586	cmse93xnq000814b4xhy5naxm	Fan Installation	fan-installation	\N	\N	499.00	60	0	0	t	2026-08-04 06:02:22.119	2026-08-10 06:17:38.849
\.


--
-- Data for Name: ServiceArea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ServiceArea" (id, "cityId", name, pincode, "isActive", "createdAt", "updatedAt") FROM stdin;
cmsbx1xlk0002bptl6skm1jsa	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-02 14:49:20.984	2026-08-02 14:49:20.984
cmsbx1xlk0003bptl7v63a653	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-02 14:49:20.984	2026-08-02 14:49:20.984
cmsbx1xlk0004bptlsynfplzo	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-02 14:49:20.984	2026-08-02 14:49:20.984
cmsbx1xlk0005bptlhx6uou2d	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-02 14:49:20.984	2026-08-02 14:49:20.984
cmse90mu10002hv1cqbbuonh5	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-04 05:59:48.121	2026-08-04 05:59:48.121
cmse90mu10003hv1ck8fr5zor	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-04 05:59:48.121	2026-08-04 05:59:48.121
cmse90mu10004hv1ck4qa5tpv	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-04 05:59:48.121	2026-08-04 05:59:48.121
cmse90mu10005hv1c2nf0cxs3	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-04 05:59:48.121	2026-08-04 05:59:48.121
cmse93xni000214b436hpd18j	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-04 06:02:22.11	2026-08-04 06:02:22.11
cmse93xni000314b45hxzj8jc	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-04 06:02:22.11	2026-08-04 06:02:22.11
cmse93xni000414b4y76r651z	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-04 06:02:22.11	2026-08-04 06:02:22.11
cmse93xni000514b4ois9nhwn	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-04 06:02:22.11	2026-08-04 06:02:22.11
cmsmtwlz9000311w7a9tus6jd	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-10 06:06:41.733	2026-08-10 06:06:41.733
cmsmtwlz9000411w7jngf036b	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-10 06:06:41.733	2026-08-10 06:06:41.733
cmsmtwlz9000511w7t0jcq7px	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-10 06:06:41.733	2026-08-10 06:06:41.733
cmsmtwlz9000611w7kwhsdfwa	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-10 06:06:41.733	2026-08-10 06:06:41.733
cmsmu70or0003c6qnhrwpbvij	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-10 06:14:47.356	2026-08-10 06:14:47.356
cmsmu70or0004c6qnpecoprlr	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-10 06:14:47.356	2026-08-10 06:14:47.356
cmsmu70or0005c6qnnga2m2t5	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-10 06:14:47.356	2026-08-10 06:14:47.356
cmsmu70or0006c6qndhobku43	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-10 06:14:47.356	2026-08-10 06:14:47.356
cmsmu7b0y000372fqaslq5440	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-10 06:15:00.754	2026-08-10 06:15:00.754
cmsmu7b0y000472fqlbhii527	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-10 06:15:00.754	2026-08-10 06:15:00.754
cmsmu7b0y000572fquwjcrikv	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-10 06:15:00.754	2026-08-10 06:15:00.754
cmsmu7b0y000672fqikpzy053	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-10 06:15:00.754	2026-08-10 06:15:00.754
cmsmuap050003owgslwrtcefz	cmsbx1xl90000bptlda1g0gnj	Vijay Nagar	452010	t	2026-08-10 06:17:38.837	2026-08-10 06:17:38.837
cmsmuap050004owgskx9x797b	cmsbx1xl90000bptlda1g0gnj	Palasia	452001	t	2026-08-10 06:17:38.837	2026-08-10 06:17:38.837
cmsmuap050005owgsjrul7h9e	cmsbx1xli0001bptlvu7vbjpr	MP Nagar	462011	t	2026-08-10 06:17:38.837	2026-08-10 06:17:38.837
cmsmuap050006owgsplbehobt	cmsbx1xli0001bptlvu7vbjpr	Arera Colony	462016	t	2026-08-10 06:17:38.837	2026-08-10 06:17:38.837
\.


--
-- Data for Name: ServiceCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ServiceCategory" (id, name, slug, description, icon, image, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmse93xnn000614b4tn98x5q7	Cleaning	cleaning	\N	cleaning.png	\N	1	t	2026-08-04 06:02:22.115	2026-08-10 06:17:38.841
cmse93xnp000714b4zol0c37n	Plumbing	plumbing	\N	plumbing.png	\N	2	t	2026-08-04 06:02:22.117	2026-08-10 06:17:38.842
cmse93xnq000814b4xhy5naxm	Electrical	electrical	\N	electrical.png	\N	3	t	2026-08-04 06:02:22.118	2026-08-10 06:17:38.843
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, phone, role, status, "isVerified", "lastLoginAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmscu7wgs0001r0kcpzm4kq98	9876543210	CUSTOMER	ACTIVE	t	2026-08-08 09:16:37.048	2026-08-03 06:17:46.781	2026-08-08 09:16:37.049	\N
cmslkbtv300017l9l7hazqjzg	9000000001	CUSTOMER	ACTIVE	t	\N	2026-08-09 08:50:49.455	2026-08-09 08:50:49.455	\N
cmslkyfey000a7l9lpbfzeuo4	9000000002	PARTNER	ACTIVE	t	2026-08-10 06:54:20.251	2026-08-09 09:08:23.818	2026-08-10 06:54:20.252	\N
cmsmtu9lo00011mxt76rbm8w2	9876598765	ADMIN	ACTIVE	t	2026-08-10 07:38:56.973	2026-08-10 06:04:52.381	2026-08-10 07:38:56.975	\N
cmsmx4va60007pg5ks1l3xfbz	9876543211	PARTNER	ACTIVE	t	2026-08-10 07:40:33.598	2026-08-10 07:37:05.886	2026-08-10 07:40:33.598	\N
\.


--
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserProfile" (id, "userId", "firstName", "lastName", email, gender, dob, avatar, language, "referralCode", "createdAt", "updatedAt") FROM stdin;
cmscv0fwf0007ray06dwq77k7	cmscu7wgs0001r0kcpzm4kq98	Shani	Jain	shani@test.com	MALE	\N	\N	en	\N	2026-08-03 06:39:58.331	2026-08-03 06:39:58.331
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f192f420-5ec1-4c13-8044-fd188c6ca0e7	87f49d217d9581691e12ea590113d5705f98c478a23a5e1f7585aa7afa410603	2026-08-02 14:48:50.288715+00	20260802144850_001_initial	\N	\N	2026-08-02 14:48:50.261432+00	1
df6e9d49-8673-4261-981b-629173ea9531	53917ea86a331abcff8fb83f54ec1b0a145ec3d99e486cb276093fd3660f983c	2026-08-03 07:59:06.161121+00	20260803075906_add_address_module	\N	\N	2026-08-03 07:59:06.142712+00	1
ea8f93ec-5869-4ae4-9ccb-b5f27ba197c1	688a657aba8ff686c84035481bcf4b921f44931ea6cf2b901d1e189fdefe6087	2026-08-04 06:02:18.943091+00	20260804060218_add_service_catalog	\N	\N	2026-08-04 06:02:18.927021+00	1
b382f749-51bb-4e63-b294-ecfd4a12c231	77924ba3ced023ed5f5c311de6c00ad5b5335ad65a74184588dcb69be5bda241	2026-08-04 13:24:17.515631+00	20260804132417_add_booking	\N	\N	2026-08-04 13:24:17.493718+00	1
b6aa3a92-f998-41b0-a0cb-7748ef695ac7	a783ff0a64c6f4dda984b7096bac528405757ff8826aadd47edd542e418d3588	2026-08-06 06:00:04.010668+00	20260806060003_add_partner	\N	\N	2026-08-06 06:00:03.984404+00	1
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AppConfiguration AppConfiguration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppConfiguration"
    ADD CONSTRAINT "AppConfiguration_pkey" PRIMARY KEY (id);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- Name: OtpVerification OtpVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpVerification"
    ADD CONSTRAINT "OtpVerification_pkey" PRIMARY KEY (id);


--
-- Name: PartnerService PartnerService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PartnerService"
    ADD CONSTRAINT "PartnerService_pkey" PRIMARY KEY ("partnerId", "serviceId");


--
-- Name: Partner Partner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: ServiceArea ServiceArea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceArea"
    ADD CONSTRAINT "ServiceArea_pkey" PRIMARY KEY (id);


--
-- Name: ServiceCategory ServiceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceCategory"
    ADD CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Address_cityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_cityId_idx" ON public."Address" USING btree ("cityId");


--
-- Name: Address_serviceAreaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_serviceAreaId_idx" ON public."Address" USING btree ("serviceAreaId");


--
-- Name: Address_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_userId_idx" ON public."Address" USING btree ("userId");


--
-- Name: AppConfiguration_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AppConfiguration_key_key" ON public."AppConfiguration" USING btree (key);


--
-- Name: Booking_bookingDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_bookingDate_idx" ON public."Booking" USING btree ("bookingDate");


--
-- Name: Booking_bookingNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON public."Booking" USING btree ("bookingNumber");


--
-- Name: Booking_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_status_idx" ON public."Booking" USING btree (status);


--
-- Name: Booking_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_userId_idx" ON public."Booking" USING btree ("userId");


--
-- Name: City_name_state_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "City_name_state_key" ON public."City" USING btree (name, state);


--
-- Name: OtpVerification_phone_purpose_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OtpVerification_phone_purpose_idx" ON public."OtpVerification" USING btree (phone, purpose);


--
-- Name: PartnerService_serviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PartnerService_serviceId_idx" ON public."PartnerService" USING btree ("serviceId");


--
-- Name: Partner_availability_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Partner_availability_idx" ON public."Partner" USING btree (availability);


--
-- Name: Partner_cityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Partner_cityId_idx" ON public."Partner" USING btree ("cityId");


--
-- Name: Partner_serviceAreaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Partner_serviceAreaId_idx" ON public."Partner" USING btree ("serviceAreaId");


--
-- Name: Partner_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Partner_status_idx" ON public."Partner" USING btree (status);


--
-- Name: Partner_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Partner_userId_key" ON public."Partner" USING btree ("userId");


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: ServiceArea_cityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ServiceArea_cityId_idx" ON public."ServiceArea" USING btree ("cityId");


--
-- Name: ServiceCategory_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON public."ServiceCategory" USING btree (slug);


--
-- Name: Service_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_categoryId_idx" ON public."Service" USING btree ("categoryId");


--
-- Name: Service_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Service_slug_key" ON public."Service" USING btree (slug);


--
-- Name: UserProfile_referralCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserProfile_referralCode_key" ON public."UserProfile" USING btree ("referralCode");


--
-- Name: UserProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserProfile_userId_key" ON public."UserProfile" USING btree ("userId");


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: Address Address_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Address Address_serviceAreaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES public."ServiceArea"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Booking Booking_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PartnerService PartnerService_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PartnerService"
    ADD CONSTRAINT "PartnerService_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PartnerService PartnerService_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PartnerService"
    ADD CONSTRAINT "PartnerService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Partner Partner_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Partner Partner_serviceAreaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES public."ServiceArea"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Partner Partner_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceArea ServiceArea_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceArea"
    ADD CONSTRAINT "ServiceArea_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Service Service_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ServiceCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfile UserProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qADttLSbu8B2lJqanMUGvGcewcytjlA5vDHCzzHacsVFBNCasdHCHVJ04bysps6

