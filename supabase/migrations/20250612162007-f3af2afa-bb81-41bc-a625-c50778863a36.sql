
-- Luodaan taulut terveysdata:lle ja indikaattoreille

-- Alueet/toimipisteet taulu
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indikaattorit taulu
CREATE TABLE public.indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sotkanet_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  organization TEXT,
  unit TEXT,
  area_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mittausdata taulu
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id UUID REFERENCES public.indicators(id) NOT NULL,
  region_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  value DECIMAL,
  absolute_value DECIMAL,
  gender TEXT DEFAULT 'total',
  data_source TEXT DEFAULT 'sotkanet',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tavoitearvot taulu
CREATE TABLE public.target_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id UUID REFERENCES public.indicators(id) NOT NULL,
  region_code TEXT NOT NULL,
  target_value DECIMAL NOT NULL,
  target_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(indicator_id, region_code, target_year)
);

-- Cache taulu API-kutsujen optimointiin
CREATE TABLE public.sotkanet_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indeksit suorituskyvyn parantamiseen
CREATE INDEX idx_health_metrics_indicator_region_year ON public.health_metrics(indicator_id, region_code, year);
CREATE INDEX idx_health_metrics_region_year ON public.health_metrics(region_code, year);
CREATE INDEX idx_sotkanet_cache_expires ON public.sotkanet_cache(expires_at);
CREATE INDEX idx_indicators_sotkanet_id ON public.indicators(sotkanet_id);

-- RLS käytännöt (kaikki data on julkista, joten sallitaan lukuoikeus kaikille)
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sotkanet_cache ENABLE ROW LEVEL SECURITY;

-- Julkinen lukuoikeus kaikille tauluille
CREATE POLICY "Allow public read access to regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to indicators" ON public.indicators FOR SELECT USING (true);
CREATE POLICY "Allow public read access to health_metrics" ON public.health_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access to target_values" ON public.target_values FOR SELECT USING (true);
CREATE POLICY "Allow public read access to sotkanet_cache" ON public.sotkanet_cache FOR SELECT USING (true);

-- Lisätään perusalueet
INSERT INTO public.regions (code, name, category) VALUES
('974', 'Pohjois-Savon hyvinvointialue', 'wellbeing_area'),
('kuopio', 'Kuopio', 'municipality'),
('iisalmi', 'Iisalmi', 'municipality'),
('varkaus', 'Varkaus', 'municipality');

-- Lisätään perus indikaattorit
INSERT INTO public.indicators (sotkanet_id, title, description, organization, unit, area_category) VALUES
(2230, 'Hoitotakuun toteutuminen perusterveydenhuollossa', 'Hoitotakuun toteutuminen perusterveydenhuollossa', 'THL', '%', 'avoterveydenhuolto'),
(1820, 'Avosairaanhoidon käynnit', 'Avosairaanhoidon käynnit / 1000 asukasta', 'THL', '/1000 as.', 'avoterveydenhuolto'),
(4420, 'Sähköisten palvelujen käyttö', 'Sähköisten palvelujen käyttö (%)', 'THL', '%', 'avoterveydenhuolto'),
(2150, 'Leikkaustoiminnan jonotusaika', 'Leikkaustoiminnan jonotusaika (päivää)', 'THL', 'päivää', 'leikkaustoiminta'),
(1840, 'Toimenpiteet', 'Toimenpiteet / 1000 asukasta', 'THL', '/1000 as.', 'leikkaustoiminta'),
(2160, 'Peruutettujen leikkausten osuus', 'Peruutettujen leikkausten osuus (%)', 'THL', '%', 'leikkaustoiminta'),
(2170, 'Päivystyksen odotusaika', 'Päivystyksen odotusaika (min)', 'THL', 'min', 'paivystys'),
(1782, 'Päivystyskäynnit', 'Päivystyskäynnit / 1000 asukasta', 'THL', '/1000 as.', 'paivystys'),
(2180, 'Uudelleenkäynnit 72h sisällä', 'Uudelleenkäynnit 72h sisällä (%)', 'THL', '%', 'paivystys');

-- Lisätään tavoitearvot
INSERT INTO public.target_values (indicator_id, region_code, target_value, target_year) VALUES
((SELECT id FROM public.indicators WHERE sotkanet_id = 2230), '974', 95, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 1820), '974', 3000, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 4420), '974', 80, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 2150), '974', 30, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 1840), '974', 180, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 2160), '974', 5, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 2170), '974', 20, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 1782), '974', 800, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 2180), '974', 10, 2024);
