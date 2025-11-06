\restrict 2s6tZqmLUFqL8I5dg9RMuopqxEKSu3TzMEkEsDgeKleIWncS2C47GCNd5BGb6dF

-- Dumped from database version 18.0 (Debian 18.0-1.pgdg13+3)
-- Dumped by pg_dump version 18.0

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
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    symbol character varying(8) NOT NULL
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_states (
    id integer NOT NULL,
    company_id integer NOT NULL,
    peg numeric(10,5),
    price numeric(18,2),
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_states_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_states_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_states_id_seq OWNED BY public.company_states.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_states id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_states ALTER COLUMN id SET DEFAULT nextval('public.company_states_id_seq'::regclass);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_symbol_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_symbol_key UNIQUE (symbol);


--
-- Name: company_states company_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_states
    ADD CONSTRAINT company_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: idx_company_states_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_states_company_id ON public.company_states USING btree (company_id);


--
-- Name: idx_company_states_timestamp_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_states_timestamp_desc ON public.company_states USING btree ("timestamp" DESC);


--
-- Name: company_states company_states_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_states
    ADD CONSTRAINT company_states_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2s6tZqmLUFqL8I5dg9RMuopqxEKSu3TzMEkEsDgeKleIWncS2C47GCNd5BGb6dF


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20251105230327'),
    ('20251106000608');
