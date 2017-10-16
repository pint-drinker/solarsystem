# responsible for parsing the test files in info and ephemeris to create a json document to look to
# initialize the solar system on the JS side

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
            d['velocity'] = [float(p1[1]), float(p1[3]), float(p1[5])]  # in au/day
            break
        if ct == 1:
            new_s = line.replace('=', ' ')
            p1 = new_s.split()
            d['position'] = [float(p1[1]), float(p1[3]), float(p1[5])]  # in au
            ct = 2
        if '= A.D. ' in line:
            ct = 1
            d['time'] = float(line.split()[0])  # in epoch time
    return d


print(parse_ephemeris('/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/earth.txt'))

