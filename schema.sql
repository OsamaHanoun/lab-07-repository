DROP TABLE IF EXISTS city;
CREATE TABLE IF NOT EXISTS city (
    id SERIAL PRIMARY KEY,
    search_querycity VARCHAR(255),
    formatted_query VARCHAR(255),
    longitude VARCHAR(25),
    latitude VARCHAR(25)
);

INSERT INTO city(search_querycity,formatted_query,longitude,latitude) VALUES ('osama','hello','35.933222','31.977291');