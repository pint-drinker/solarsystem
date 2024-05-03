import math
import json
import os

from dateutil import parser
from datetime import datetime

AU = 149597870700  # meters
DAY = 86400  # seconds


def parse_ephemeris(file_path):
    """
    Takes a filepath object and returns a dictionary populated with ephemeris information
    
    :param file_path: string to path
    :return: dictionary of ephemeris info
    """
    # initialize dictionary
    d = {'time': 0, 'position': [], 'velocity': []}

    file = open(file_path, 'r')
    lines = file.readlines()
    ct = 0
    for line in lines:
        if ct == 2:
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['velocity'] = [float(p1[1]) * AU / DAY, float(p1[3]) * AU / DAY, float(p1[5]) * AU / DAY]
            break
        if ct == 1:
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['position'] = [float(p1[1]) * AU, float(p1[3]) * AU, float(p1[5]) * AU]
            ct = 2
        if '= A.D. ' in line:
            ct = 1
            p1 = line.split()
            date_string = p1[3] + ' ' + p1[4]  # grabbing the date string
            dt = parser.parse(date_string)
            date1 = datetime.strptime(str(dt), '%Y-%m-%d %H:%M:%S')
            # need to get the number of milliseconds elapsed since Jan 1 1970, the beggining of UTC time
            date_orig = datetime(1970, 1, 1)
            difference = date1 - date_orig
            # 5 hour offset from est to utc
            elapsed_milliseconds = difference.total_seconds() * pow(10, 3) + 5 * 3600 * pow(10, 3)
            d['time'] = elapsed_milliseconds
    return d


INFO_DIRECTORY = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src/info'
)
PARSED_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src/PLANET_DATA.js'
)


def build_planet_info_and_parse_ephemeris():
    """
    Parses the ephemeris files and builds a dictionary of planet information to be used
    in the three.js context.
    """
    if not os.path.exists(INFO_DIRECTORY):
        raise ValueError(
            f'{INFO_DIRECTORY} does not exist...make sure the fetching of body data succeeded'
        )

    planet_dict = {}

    sun = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'sun.txt'))
    sun['radius'] = 6.963 * pow(10, 8)
    sun['mass'] = 1.988544 * pow(10, 30)
    sun['omega'] = 2 * math.pi / 25.38 / DAY
    sun['obliquity'] = 7.25 * math.pi / 180
    planet_dict['sun'] = sun

    mercury = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'mercury.txt'))
    mercury['radius'] = 2440000
    mercury['mass'] = 3.302 * pow(10, 23)
    mercury['omega'] = 2 * math.pi / 175.9421 / DAY
    mercury['obliquity'] = 2.11 / 60 * math.pi / 180
    planet_dict['mercury'] = mercury

    venus = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'venus.txt'))
    venus['radius'] = 6051800
    venus['mass'] = 4.8685 * pow(10, 23)
    venus['omega'] = 2 * math.pi / 116.749 / DAY
    venus['obliquity'] = 177.3 * math.pi / 180
    planet_dict['venus'] = venus

    earth = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'earth.txt'))
    earth['radius'] = 6371010
    earth['mass'] = 5.97219 * pow(10, 24)
    earth['omega'] = 7.292115 * pow(10, -5)
    earth['obliquity'] = 23.45 * math.pi / 180
    planet_dict['earth'] = earth

    moon = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'moon.txt'))
    moon['radius'] = 1737400
    moon['mass'] = 734.9 * pow(10, 20)
    moon['omega'] = 2 * math.pi / 27.321582 / DAY
    moon['obliquity'] = 6.67 * math.pi / 180
    planet_dict['moon'] = moon

    mars = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'mars.txt'))
    mars['radius'] = 3389900
    mars['mass'] = 6.4185 * pow(10, 23)
    mars['omega'] = 2 * math.pi / 1.0274907 / DAY
    mars['obliquity'] = 25.19 * math.pi / 180
    planet_dict['mars'] = mars

    jupiter = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'jupiter.txt'))
    jupiter['radius'] = 71492000
    jupiter['mass'] = 1898.13 * pow(10, 24)
    jupiter['omega'] = 1.75864 * pow(10, -4)
    jupiter['obliquity'] = 3.12 * math.pi / 180
    planet_dict['jupiter'] = jupiter

    io = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'io.txt'))
    io['radius'] = 1821300
    io['mass'] = 893.3e20
    io['omega'] = 2 * math.pi / 1.769138 / 24 / 3600  # synchronous
    io['obliquity'] = 0  # not given
    planet_dict['io'] = io

    europa = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'europa.txt'))
    europa['radius'] = 1565000
    europa['mass'] = 479.7e20
    europa['omega'] = 2 * math.pi / 3.551810 / 24 / 3600  # synchronous
    europa['obliquity'] = 0  # not given
    planet_dict['europa'] = europa

    ganymede = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'ganymede.txt'))
    ganymede['radius'] = 2634000
    ganymede['mass'] = 1482e20
    ganymede['omega'] = 2 * math.pi / 7.154553 / 24 / 3600  # synchronous
    ganymede['obliquity'] = 0  # not given
    planet_dict['ganymede'] = ganymede

    callisto = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'callisto.txt'))
    callisto['radius'] = 2403000
    callisto['mass'] = 1076e20
    callisto['omega'] = 2 * math.pi / 16.689018 / 24 / 3600  # synchronous
    callisto['obliquity'] = 0  # not given
    planet_dict['callisto'] = callisto

    saturn = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'saturn.txt'))
    saturn['radius'] = 60268000
    saturn['mass'] = 5.68319 * pow(10, 26)
    saturn['omega'] = 1.63785 * pow(10, -4)
    saturn['obliquity'] = 26.73 * math.pi / 180
    planet_dict['saturn'] = saturn

    titan = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'titan.txt'))
    titan['radius'] = 2575500
    titan['mass'] = 13455.3e19
    titan['omega'] = 2 * math.pi / 15.945421 / 24 / 3600  # synchronous
    titan['obliquity'] = 0  # not given
    planet_dict['titan'] = titan

    uranus = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'uranus.txt'))
    uranus['radius'] = 25559000
    uranus['mass'] = 86.8103 * pow(10, 24)
    uranus['omega'] = 1.012 * pow(10, -4)
    uranus['obliquity'] = 97.86 * math.pi / 180
    planet_dict['uranus'] = uranus

    neptune = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'neptune.txt'))
    neptune['radius'] = 24766000
    neptune['mass'] = 102.41 * pow(10, 24)
    neptune['omega'] = 1.083 * pow(10, -4)
    neptune['obliquity'] = 29.56 * math.pi / 180
    planet_dict['neptune'] = neptune

    triton = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'triton.txt'))
    triton['radius'] = 1352600
    triton['mass'] = 214.7e20
    triton['omega'] = 2 * math.pi / 5.876854 / 24 / 3600  # synchronous
    triton['obliquity'] = 0  # not given
    planet_dict['triton'] = triton

    pluto = parse_ephemeris(os.path.join(INFO_DIRECTORY, 'pluto.txt'))
    pluto['radius'] = 1195000
    pluto['mass'] = 1.307 * pow(10, 22)
    pluto['omega'] = 1.13851 * pow(10, -5)
    pluto['obliquity'] = 10 * math.pi / 180
    planet_dict['pluto'] = pluto

    with open(PARSED_FILE, 'w') as outfile:
        outfile.write('data = ')
        json.dump(planet_dict, outfile)


if __name__ == '__main__':
    build_planet_info_and_parse_ephemeris()
