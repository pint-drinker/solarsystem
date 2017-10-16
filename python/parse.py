# responsible for parsing the test files in info and ephemeris to create a json document to look to
# initialize the solar system on the JS side
import math
import json

AU = 149597870700  # meters
DAY = 86400  # seconds

def parse_info_earth(file_path):

    # initialize dictionary
    d = {'radius': 0, 'mass': 0, 'period': 0, 'local_omega': 0, 'obliquity': 0}

    file = open(file_path, 'r')
    lines = file.readlines()
    for line in lines:
        if 'Mean radius, km' in line:
            # this line contains the radius and the mass value
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['radius'] = float(p1[3].split('+')[0]) * 1000  # because its in km
            d['mass'] = float(p1[-1].split('+')[0]) * pow(10, 24)  # because its in 10^24 kg
        elif 'Mean rot. rate' in line:
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['local_omega'] = float(p1[5].split('*')[0]) * pow(10, -5)  # rad/s
        elif 'Sidereal period, hr' in line:
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['period'] = float(p1[3]) * 3600  # seconds
        elif 'Obliquity to orbit, deg' in line:
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['obliquity'] = float(p1[4]) * math.pi / 180  # radians
            break
    return d


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
            d['time'] = float(line.split()[0])  # in epoch time
    return d


# print(parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/earth.txt'))
# print(parse_info_earth('/Users/dwensberg/Desktop/development/solarsystem/src/info/earth.txt'))

class PlanetConstants:

    planet_dict = {}

    sun = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/sun.txt')
    sun['radius'] = 6.963 * pow(10, 8)
    sun['mass'] = 1.988544 * pow(10, 30)
    sun['omega'] = 2 * math.pi / 25.38 / DAY
    sun['obliquity'] = 7.25 * math.pi / 180
    planet_dict['sun'] = sun

    mercury = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/mercury.txt')
    mercury['radius'] = 2440000
    mercury['mass'] = 3.302 * pow(10, 23)
    mercury['omega'] = 2 * math.pi / 175.9421 / DAY
    mercury['obliquity'] = 2.11 / 60 * math.pi / 180
    planet_dict['mercury'] = mercury

    venus = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/venus.txt')
    venus['radius'] = 6051800
    venus['mass'] = 4.8685 * pow(10, 23)
    venus['omega'] = 2 * math.pi / 116.749 / DAY
    venus['obliquity'] = 177.3 * math.pi / 180
    planet_dict['venus'] = venus

    earth = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/earth.txt')
    earth['radius'] = 6371010
    earth['mass'] = 5.97219 * pow(10, 23)
    earth['omega'] = 7.292115 * pow(10, -5)
    earth['obliquity'] = 23.45 * math.pi / 180
    planet_dict['earth'] = earth

    moon = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/moon.txt')
    moon['radius'] = 1737400
    moon['mass'] = 734.9 * pow(10, 20)
    moon['omega'] = 2 * math.pi / 27.321582 / DAY
    moon['obliquity'] = 6.67 * math.pi / 180
    planet_dict['moon'] = moon

    mars = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/mars.txt')
    mars['radius'] = 3389900
    mars['mass'] = 6.4185 * pow(10, 23)
    mars['omega'] = 2 * math.pi / 1.0274907 / DAY
    mars['obliquity'] = 25.19 * math.pi / 180
    planet_dict['mars'] = mars

    jupiter = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/jupiter.txt')
    jupiter['radius'] = 71492000
    jupiter['mass'] = 1898.13 * pow(10, 24)
    jupiter['omega'] = 1.75864 * pow(10, -4)
    jupiter['obliquity'] = 3.12 * math.pi / 180
    planet_dict['jupiter'] = jupiter

    saturn = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/saturn.txt')
    saturn['radius'] = 60268000
    saturn['mass'] = 5.68319 * pow(10, 26)
    saturn['omega'] = 1.63785 * pow(10, -4)
    saturn['obliquity'] = 26.73 * math.pi / 180
    planet_dict['saturn'] = saturn

    # neptune = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/neptune.txt')
    # neptune['radius'] = 6051800
    # neptune['mass'] = 4.8685 * pow(10, 23)
    # neptune['omega'] = 2 * math.pi / 116.749 / DAY
    # neptune['obliquity'] = 177.3 * math.pi / 180
    # planet_dict['neptune'] = neptune

    pluto = parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/pluto.txt')
    pluto['radius'] = 1195000
    pluto['mass'] = 1.307 * pow(10, 22)
    pluto['omega'] = 1.13851 * pow(10, -5)
    pluto['obliquity'] = 10 * math.pi / 180
    planet_dict['pluto'] = pluto

    with open('/Users/dwensberg/Desktop/development/solarsystem/src/parse.js', 'w') as outfile:
        json.dump(planet_dict, outfile)

pc = PlanetConstants