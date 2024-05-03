import time
import os
from datetime import timedelta, datetime

import requests

from parse import build_planet_info_and_parse_ephemeris

INPUT_DATE_FORMAT = "%Y-%b-%d %H:%M:%S"
INFO_DIRECTORY = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src/info'
)

SUN = dict(id=10, name='Sun', local='sun.txt')
MERCURY = dict(id=199, name='Mercury', local='mercury.txt')
VENUS = dict(id=299, name='Venus', local='venus.txt')
EARTH = dict(id=399, name='Earth', local='earth.txt')
MOON = dict(id=301, name='Moon', local='moon.txt')
MARS = dict(id=499, name='Mars', local='mars.txt')
JUPITER = dict(id=599, name='Jupiter', local='jupiter.txt')
IO = dict(id=501, name='Io', local='io.txt')
EUROPA = dict(id=502, name='Europa', local='europa.txt')
GANYMEDE = dict(id=503, name='Ganymede', local='ganymede.txt')
CALLISTO = dict(id=504, name='Callisto', local='callisto.txt')
SATURN = dict(id=699, name='Saturn', local='saturn.txt')
TITAN = dict(id=606, name='Titan', local='titan.txt')
URANUS = dict(id=799, name='Uranus', local='uranus.txt')
NEPTUNE = dict(id=899, name='Neptune', local='neptune.txt')
TRITON = dict(id=801, name='Triton', local='triton.txt')
PLUTO = dict(id=999, name='Pluto', local='pluto.txt')

BODIES = [
    SUN, MERCURY, VENUS, EARTH, MOON, MARS, JUPITER, IO, EUROPA, GANYMEDE, CALLISTO, SATURN, TITAN, URANUS, NEPTUNE, TRITON, PLUTO
]


def fetch_body_data(body_id: int, start_date: datetime) -> dict:
    """
    Fetch the data for a given body ID and start date.
    Look here for more docs on Horizons API: https://ssd-api.jpl.nasa.gov/doc/horizons.html
    :param body_id:
    :param start_date:
    :return:
    """
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    start_date_str = start_date.isoformat()
    end_date_str = (start_date + timedelta(minutes=10)).isoformat()
    params = {
        "format": "json",
        "COMMAND": f"'{body_id}'",
        "OBJ_DATA": "YES",
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "VECTORS",
        "CENTER": "'@sun'",
        "START_TIME": start_date_str,
        "STOP_TIME": end_date_str,
        "STEP_SIZE": "10m",
        "REF_PLANE": "ECLIPTIC",
        "OUT_UNITS": "AU-D",
        "VEC_TABLE": "3",  # 3 for vectors as specified
        "VEC_LABELS": "YES",
        "CSV_FORMAT": "NO",
        "TLIST": None  # Not needed unless specific times are required
    }

    response = requests.get(url, params=params)
    return response.json()


if __name__ == '__main__':
    default_date = "2015-Jan-4 01:37:00"
    start_date_input = input(
        f"Please enter start date in the format of YYYY-MM-DD HH:MM:SS (leave blank to use the default date of {default_date}): "
    )
    start_date_input = start_date_input or default_date
    try:
        start = datetime.strptime(start_date_input, INPUT_DATE_FORMAT)
    except ValueError:
        raise ValueError("Incorrect date format, please try again.")

    print(f'Using start date of: {start.strftime(INPUT_DATE_FORMAT)}')

    t1 = time.time()
    if not os.path.exists(INFO_DIRECTORY):
        os.makedirs(INFO_DIRECTORY)

    for body in BODIES:
        interval_time = time.time()
        json_payload = fetch_body_data(body_id=body['id'], start_date=start)
        with open(os.path.join(INFO_DIRECTORY, body["local"]), 'w') as f:
            f.write(json_payload['result'])
        print(f'Fetched info for {body["name"]} in {round(time.time() - interval_time, 2)} seconds')
    print(f'Total time to fetch: {round(time.time() - t1, 2)}')

    t2 = time.time()
    build_planet_info_and_parse_ephemeris()
    print(f'Successfully parsed ephemeris in {round(time.time() - t2, 2)} seconds')
    print('Go ahead and start up the simulation!')
