DROP TABLE IF EXISTS city;
CREATE TABLE IF NOT EXISTS city (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255),
    city_location VARCHAR(255),
    lon int,
    lat int
);

INSERT INTO city(city_name,city_location,lon,lat) VALUES ('Mars','hello',35.00,34.00);