--
-- PostgreSQL database dump
--

\restrict ICwF0otNgZadew6dHK2spTPXIzgldZVlPbKxqdaTKhWzvCIYGGwQ3UkMiHIxKrm

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

-- Started on 2026-09-13 17:00:31 +0330

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16967)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    thought_id integer NOT NULL,
    user_id integer NOT NULL,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    likes integer DEFAULT 0,
    edited boolean DEFAULT false
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16966)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- TOC entry 4542 (class 0 OID 0)
-- Dependencies: 222
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 227 (class 1259 OID 17162)
-- Name: comments_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments_likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    thought_id integer NOT NULL,
    comment_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    liked boolean
);


ALTER TABLE public.comments_likes OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17161)
-- Name: comments_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_likes_id_seq OWNER TO postgres;

--
-- TOC entry 4543 (class 0 OID 0)
-- Dependencies: 226
-- Name: comments_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_likes_id_seq OWNED BY public.comments_likes.id;


--
-- TOC entry 220 (class 1259 OID 16862)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(225) NOT NULL,
    password text NOT NULL,
    post text,
    avatar text,
    bio text,
    name text,
    surname text,
    dark_mode boolean DEFAULT false,
    email text,
    is_verified boolean DEFAULT false,
    verification_code character varying(6),
    verification_expires_at timestamp with time zone,
    change_password_code text,
    password_code_expires_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17126)
-- Name: comments_users; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.comments_users AS
 SELECT comments.id AS comment_id,
    comments.thought_id,
    comments.user_id,
    comments.comment,
    comments.created_at,
    comments.likes,
    comments.edited,
    users.username,
    users.name,
    users.surname AS lastname,
    users.avatar
   FROM (public.comments
     JOIN public.users ON ((users.id = comments.user_id)));


ALTER VIEW public.comments_users OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16850)
-- Name: thoughts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thoughts (
    id integer NOT NULL,
    post text,
    date_created timestamp with time zone DEFAULT now(),
    like_received integer DEFAULT 0,
    is_edited boolean DEFAULT false,
    user_id integer
);


ALTER TABLE public.thoughts OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17121)
-- Name: fetch_all_data; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.fetch_all_data AS
 SELECT users.id AS user_id,
    thoughts.id AS thought_id,
    users.username,
    users.name,
    users.surname AS lastname,
    users.avatar,
    users.email,
    users.is_verified,
    users.bio,
    thoughts.post AS text,
    thoughts.date_created AS date,
    thoughts.like_received AS likes,
    thoughts.is_edited AS edited_thought
   FROM (public.users
     JOIN public.thoughts ON ((users.id = thoughts.user_id)));


ALTER VIEW public.fetch_all_data OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16940)
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    user_id integer NOT NULL,
    thought_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    liked boolean
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17192)
-- Name: public_users; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.public_users AS
 SELECT id,
    username,
    avatar,
    bio,
    name,
    surname,
    is_verified,
    email
   FROM public.users;


ALTER VIEW public.public_users OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17198)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    refresh_token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    jti uuid NOT NULL,
    ip_address inet,
    user_agent text
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17197)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4544 (class 0 OID 0)
-- Dependencies: 229
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 217 (class 1259 OID 16849)
-- Name: thoughts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.thoughts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thoughts_id_seq OWNER TO postgres;

--
-- TOC entry 4545 (class 0 OID 0)
-- Dependencies: 217
-- Name: thoughts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.thoughts_id_seq OWNED BY public.thoughts.id;


--
-- TOC entry 219 (class 1259 OID 16861)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4546 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4355 (class 2604 OID 16970)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4359 (class 2604 OID 17165)
-- Name: comments_likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_likes ALTER COLUMN id SET DEFAULT nextval('public.comments_likes_id_seq'::regclass);


--
-- TOC entry 4361 (class 2604 OID 17201)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4347 (class 2604 OID 16854)
-- Name: thoughts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thoughts ALTER COLUMN id SET DEFAULT nextval('public.thoughts_id_seq'::regclass);


--
-- TOC entry 4351 (class 2604 OID 16865)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4374 (class 2606 OID 17168)
-- Name: comments_likes comments_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_likes
    ADD CONSTRAINT comments_likes_pkey PRIMARY KEY (id);


--
-- TOC entry 4376 (class 2606 OID 17170)
-- Name: comments_likes comments_likes_user_id_thought_id_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_likes
    ADD CONSTRAINT comments_likes_user_id_thought_id_comment_id_key UNIQUE (user_id, thought_id, comment_id);


--
-- TOC entry 4372 (class 2606 OID 16975)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4370 (class 2606 OID 16945)
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (user_id, thought_id);


--
-- TOC entry 4378 (class 2606 OID 17213)
-- Name: refresh_tokens refresh_tokens_jti_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_jti_key UNIQUE (jti);


--
-- TOC entry 4380 (class 2606 OID 17206)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4364 (class 2606 OID 16858)
-- Name: thoughts thoughts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thoughts
    ADD CONSTRAINT thoughts_pkey PRIMARY KEY (id);


--
-- TOC entry 4366 (class 2606 OID 16869)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4368 (class 2606 OID 16871)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4385 (class 2606 OID 17181)
-- Name: comments_likes comments_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_likes
    ADD CONSTRAINT comments_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 4386 (class 2606 OID 17176)
-- Name: comments_likes comments_likes_thought_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_likes
    ADD CONSTRAINT comments_likes_thought_id_fkey FOREIGN KEY (thought_id) REFERENCES public.thoughts(id) ON DELETE CASCADE;


--
-- TOC entry 4387 (class 2606 OID 17171)
-- Name: comments_likes comments_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_likes
    ADD CONSTRAINT comments_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4383 (class 2606 OID 16976)
-- Name: comments comments_thought_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_thought_id_fkey FOREIGN KEY (thought_id) REFERENCES public.thoughts(id) ON DELETE CASCADE;


--
-- TOC entry 4384 (class 2606 OID 16981)
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4381 (class 2606 OID 16951)
-- Name: likes likes_thought_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_thought_id_fkey FOREIGN KEY (thought_id) REFERENCES public.thoughts(id) ON DELETE CASCADE;


--
-- TOC entry 4382 (class 2606 OID 16946)
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4388 (class 2606 OID 17207)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-09-13 17:00:31 +0330

--
-- PostgreSQL database dump complete
--

\unrestrict ICwF0otNgZadew6dHK2spTPXIzgldZVlPbKxqdaTKhWzvCIYGGwQ3UkMiHIxKrm

