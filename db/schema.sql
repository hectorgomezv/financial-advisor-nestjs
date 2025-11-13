\restrict WxPuZJ8vNhARNvd7D2OenaPFVMkYbIHx8AOm1CYc9LIWKfGrEYKhR61qpwJ2G9c

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
    currency character varying(8) NOT NULL,
    enterprise_to_ebitda numeric(10,5),
    enterprise_to_revenue numeric(10,5),
    forward_pe numeric(10,5),
    price numeric(18,2) NOT NULL,
    profit_margin numeric(10,5),
    short_percent numeric(10,5),
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
-- Name: index_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.index_states (
    index_id integer NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    value numeric(18,5) NOT NULL
);


--
-- Name: indices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.indices (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    symbol character varying(8) NOT NULL
);


--
-- Name: indices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.indices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: indices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.indices_id_seq OWNED BY public.indices.id;


--
-- Name: portfolio_contributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_contributions (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    amount_eur numeric(10,2) NOT NULL
);


--
-- Name: portfolio_contributions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolio_contributions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolio_contributions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolio_contributions_id_seq OWNED BY public.portfolio_contributions.id;


--
-- Name: portfolio_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_states (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    cash numeric(10,2),
    is_valid boolean NOT NULL,
    roic_eur numeric(18,5),
    sum_weights numeric(10,5) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    total_value_eur numeric(18,2) NOT NULL
);


--
-- Name: portfolio_states_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolio_states_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolio_states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolio_states_id_seq OWNED BY public.portfolio_states.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    cash numeric(18,2),
    created timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(64) NOT NULL,
    owner_id character varying(64)
);


--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    company_id integer NOT NULL,
    blocked boolean NOT NULL,
    shares numeric(10,2) NOT NULL,
    shares_updated_at timestamp with time zone DEFAULT now() NOT NULL,
    target_weight numeric(5,2) NOT NULL,
    value numeric(18,5) DEFAULT (0)::numeric NOT NULL
);


--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


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
-- Name: indices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indices ALTER COLUMN id SET DEFAULT nextval('public.indices_id_seq'::regclass);


--
-- Name: portfolio_contributions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_contributions ALTER COLUMN id SET DEFAULT nextval('public.portfolio_contributions_id_seq'::regclass);


--
-- Name: portfolio_states id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_states ALTER COLUMN id SET DEFAULT nextval('public.portfolio_states_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


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
-- Name: indices indices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indices
    ADD CONSTRAINT indices_pkey PRIMARY KEY (id);


--
-- Name: indices indices_symbol_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indices
    ADD CONSTRAINT indices_symbol_key UNIQUE (symbol);


--
-- Name: portfolio_contributions portfolio_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_contributions
    ADD CONSTRAINT portfolio_contributions_pkey PRIMARY KEY (id);


--
-- Name: portfolio_states portfolio_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_states
    ADD CONSTRAINT portfolio_states_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_name_key UNIQUE (name);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


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
-- Name: idx_index_states_index_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_index_states_index_id ON public.index_states USING btree (index_id);


--
-- Name: idx_index_states_timestamp_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_index_states_timestamp_desc ON public.index_states USING btree ("timestamp" DESC);


--
-- Name: idx_portfolio_contributions_portfolio_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_contributions_portfolio_id ON public.portfolio_contributions USING btree (portfolio_id);


--
-- Name: idx_portfolio_contributions_timestamp_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_contributions_timestamp_desc ON public.portfolio_contributions USING btree ("timestamp" DESC);


--
-- Name: idx_portfolio_states_portfolio_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_states_portfolio_id ON public.portfolio_states USING btree (portfolio_id);


--
-- Name: idx_portfolio_states_timestamp_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_states_timestamp_desc ON public.portfolio_states USING btree ("timestamp" DESC);


--
-- Name: idx_uniq_positions_portfolio_id_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_uniq_positions_portfolio_id_company_id ON public.positions USING btree (portfolio_id, company_id);


--
-- Name: company_states company_states_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_states
    ADD CONSTRAINT company_states_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: index_states index_states_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.index_states
    ADD CONSTRAINT index_states_index_id_fkey FOREIGN KEY (index_id) REFERENCES public.indices(id) ON DELETE CASCADE;


--
-- Name: portfolio_contributions portfolio_contributions_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_contributions
    ADD CONSTRAINT portfolio_contributions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: portfolio_states portfolio_states_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_states
    ADD CONSTRAINT portfolio_states_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: positions positions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: positions positions_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict WxPuZJ8vNhARNvd7D2OenaPFVMkYbIHx8AOm1CYc9LIWKfGrEYKhR61qpwJ2G9c


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20251105230327'),
    ('20251106000608'),
    ('20251108155033'),
    ('20251108234900'),
    ('20251109071528'),
    ('20251109071603');
