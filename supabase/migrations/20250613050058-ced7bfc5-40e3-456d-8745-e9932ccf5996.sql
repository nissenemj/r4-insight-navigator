
-- Päivitetään olemassa olevat indikaattorit uusilla Sotkanet ID:illä ja lisätään uudet

-- Avoterveydenhuolto - päivitetään vanhat
UPDATE public.indicators 
SET sotkanet_id = 3176, 
    title = 'Perusterveydenhuollon avosairaanhoidon lääkärin kiireettömän käynnin odotusaika yli 3 kk',
    description = 'Perusterveydenhuollon avosairaanhoidon lääkärin kiireettömän käynnin odotusaika yli 3 kk hoidon tarpeen arvioinnista, % toteutuneista käynneistä'
WHERE sotkanet_id = 2230;

UPDATE public.indicators 
SET sotkanet_id = 1552,
    title = 'Perusterveydenhuollon avohoidon kaikki lääkärikäynnit',
    description = 'Perusterveydenhuollon avohoidon kaikki lääkärikäynnit / 1 000 asukasta'
WHERE sotkanet_id = 1820;

UPDATE public.indicators 
SET sotkanet_id = 5549,
    title = 'Asioinut digitaalisesti sosiaali- tai terveydenhuollon ammattilaisen kanssa',
    description = 'Asioinut digitaalisesti sosiaali- tai terveydenhuollon ammattilaisen kanssa, (%) palveluja käyttäneistä, 20-64-vuotiaat'
WHERE sotkanet_id = 4420;

-- Leikkaustoiminta - päivitetään vanhat
UPDATE public.indicators 
SET sotkanet_id = 5083,
    title = 'Erikoissairaanhoitoa odottavien odotusaika, mediaani',
    description = 'Erikoissairaanhoitoa 31.12. odottavien odotusaika, mediaani',
    unit = 'päivää'
WHERE sotkanet_id = 2150;

UPDATE public.indicators 
SET sotkanet_id = 2989,
    title = 'Toimenpiteellisten hoitojaksojen keskimääräinen pituus',
    description = 'Toimenpiteellisten hoitojaksojen (kirurgiset toimenpiteet) keskimääräinen pituus',
    unit = 'päivää'
WHERE sotkanet_id = 1840;

UPDATE public.indicators 
SET sotkanet_id = 3336,
    title = 'Erikoissairaanhoitoa yli 6 kk odottaneet',
    description = 'Erikoissairaanhoitoa yli 6 kk odottaneet vuoden aikana / 10 000 asukasta',
    unit = '/10 000 as.'
WHERE sotkanet_id = 2160;

-- Päivystys - päivitetään vanhat
UPDATE public.indicators 
SET sotkanet_id = 5081,
    title = 'Päivystyskäynnit perusterveydenhuollossa',
    description = 'Päivystyskäynnit perusterveydenhuollossa (ml. yhteispäivystys) / 1 000 asukasta'
WHERE sotkanet_id = 2170;

UPDATE public.indicators 
SET sotkanet_id = 5077,
    title = 'Päivystyskäynnit erikoissairaanhoidossa',
    description = 'Päivystyskäynnit erikoissairaanhoidossa / 1 000 asukasta'
WHERE sotkanet_id = 1782;

UPDATE public.indicators 
SET sotkanet_id = 5104,
    title = 'Päivystykseen 48h sisällä palanneet aikuiset',
    description = 'Päivystykseen 48 tunnin sisällä palanneet 18 vuotta täyttäneet potilaat, % päivystyksessä hoidetuista'
WHERE sotkanet_id = 2180;

-- Lisätään uudet indikaattorit

-- Avoterveydenhuolto - lisää indikaattorit
INSERT INTO public.indicators (sotkanet_id, title, description, organization, unit, area_category) VALUES
(2676, 'Perusterveydenhuollon avosairaanhoidon lääkärin kiireettömän käynnin odotusaika yli 7 pv', 'Perusterveydenhuollon avosairaanhoidon lääkärin kiireettömän käynnin odotusaika yli 7 pv hoidon tarpeen arvioinnista, % toteutuneista käynneistä', 'THL', '%', 'avoterveydenhuolto'),
(4123, 'Perusterveydenhuollon avosairaanhoidon lääkärikäynnit yhteensä', 'Perusterveydenhuollon avosairaanhoidon lääkärikäynnit yhteensä / 1 000 asukasta', 'THL', '/1000 as.', 'avoterveydenhuolto'),
(5534, 'Sähköinen asiointi korvasi perinteisen käynnin', 'Sähköinen asiointi korvasi vähintään yhden perinteisen käynnin, (%) sähköisiä palveluja käyttäneistä', 'THL', '%', 'avoterveydenhuolto'),
(5543, 'Esteitä sähköisten palvelujen käytössä, 65+', 'Kokenut esteitä ja huolia sähköisten palvelujen käytössä (%), 65 vuotta täyttäneet', 'THL', '%', 'avoterveydenhuolto');

-- Leikkaustoiminta - lisää indikaattorit
INSERT INTO public.indicators (sotkanet_id, title, description, organization, unit, area_category) VALUES
(3000, 'Toimenpiteellisten hoitojaksojen hoitopäivät 18-64v', 'Toimenpiteellisten hoitojaksojen (kirurgiset toimenpiteet) hoitopäivät 18-64-vuotiailla / 1 000 vastaavan ikäistä', 'THL', '/1000 as.', 'leikkaustoiminta');

-- Päivystys - lisää indikaattorit
INSERT INTO public.indicators (sotkanet_id, title, description, organization, unit, area_category) VALUES
(5244, 'Päivystykseen 48h sisällä palanneet alle 18v', 'Päivystykseen 48 tunnin sisällä palanneet alle 18-vuotiaat potilaat, % päivystyksessä hoidetuista', 'THL', '%', 'paivystys');

-- Lisätään tavoitearvot uusille indikaattoreille
INSERT INTO public.target_values (indicator_id, region_code, target_value, target_year) VALUES
-- Avoterveydenhuolto
((SELECT id FROM public.indicators WHERE sotkanet_id = 2676), '974', 7, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 4123), '974', 2800, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 5534), '974', 75, 2024),
((SELECT id FROM public.indicators WHERE sotkanet_id = 5543), '974', 15, 2024),
-- Leikkaustoiminta
((SELECT id FROM public.indicators WHERE sotkanet_id = 3000), '974', 200, 2024),
-- Päivystys
((SELECT id FROM public.indicators WHERE sotkanet_id = 5244), '974', 8, 2024);

-- Päivitetään vanhojen indikaattorien tavoitearvot
UPDATE public.target_values 
SET target_value = 5 
WHERE indicator_id = (SELECT id FROM public.indicators WHERE sotkanet_id = 3176);

UPDATE public.target_values 
SET target_value = 60 
WHERE indicator_id = (SELECT id FROM public.indicators WHERE sotkanet_id = 5083);

UPDATE public.target_values 
SET target_value = 7 
WHERE indicator_id = (SELECT id FROM public.indicators WHERE sotkanet_id = 2989);

UPDATE public.target_values 
SET target_value = 50 
WHERE indicator_id = (SELECT id FROM public.indicators WHERE sotkanet_id = 3336);
