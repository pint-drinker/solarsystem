# for facilitating communication with telnet and pulling it down locally

import time
import pexpect

# time the whole process overall
st = time.time()

# start date marker
start_date = '2015-Jan-4 01:37:00'  # roughly the periapsis from 2015
end_date = '2015-Jan-4 01:47:00'  # to allow for one time interval, Mathc this to martian movie timing

# these will correspond to the information we extract about every single body in the system, first with
# their physical parameters, and then their ephemeris data at the given input time
# all of these will be grabbed and saved via an ftp connection at the end of parsing for info
sun = {'id': 10, 'local': 'sun.txt', 'remote_info': '', 'remote_eph': ''}
mercury = {'id': 199, 'local': 'mercury.txt', 'remote_info': '', 'remote_eph': ''}
venus = {'id': 299, 'local': 'venus.txt', 'remote_info': '', 'remote_eph': ''}
earth = {'id': 399, 'local': 'earth.txt', 'remote_info': '', 'remote_eph': ''}
moon = {'id': 301, 'local': 'moon.txt', 'remote_info': '', 'remote_eph': ''}
mars = {'id': 499, 'local': 'mars.txt', 'remote_info': '', 'remote_eph': ''}
jupiter = {'id': 599, 'local': 'jupiter.txt', 'remote_info': '', 'remote_eph': ''}
io = {'id': 501, 'local': 'io.txt', 'remote_info': '', 'remote_eph': ''}
europa = {'id': 502, 'local': 'europa.txt', 'remote_info': '', 'remote_eph': ''}
ganymede = {'id': 503, 'local': 'ganymede.txt', 'remote_info': '', 'remote_eph': ''}
callisto = {'id': 504, 'local': 'callisto.txt', 'remote_info': '', 'remote_eph': ''}
saturn = {'id': 699, 'local': 'saturn.txt', 'remote_info': '', 'remote_eph': ''}
titan = {'id': 606, 'local': 'titan.txt', 'remote_info': '', 'remote_eph': ''}
uranus = {'id': 799, 'local': 'uranus.txt', 'remote_info': '', 'remote_eph': ''}
neptune = {'id': 899, 'local': 'neptune.txt', 'remote_info': '', 'remote_eph': ''}
triton = {'id': 801, 'local': 'triton.txt', 'remote_info': '', 'remote_eph': ''}
pluto = {'id': 999, 'local': 'pluto.txt', 'remote_info': '', 'remote_eph': ''}
bodies = [sun, mercury, venus, earth, moon, mars, jupiter, io, europa, ganymede, callisto,
          saturn, titan, uranus, neptune, triton, pluto]

# path to get us to the telnet interface to grab ephemeris
open_path = 'telnet horizons.jpl.nasa.gov 6775'

# open up the pexpect instance
child = pexpect.spawn(open_path)
child.expect ('Horizons> ')
child.sendline('PAGE')  # turn off the paging
child.expect ('Horizons> ')

# now loop through the bodies information stuff and collect all the names of the info and ephemeris
# files that we will pull down using an ftp connection at the end
for body in bodies:
    child.sendline(str(body['id']))  # index for the planet
    child.expect('<cr>: ')
    # collects general info that we then need to save
    child.sendline('Ftp')  # store this file in the jpl server remotely to pull down
    child.expect('Select...')
    # grab file name from the last child output
    check_str = str(child.before)
    search_phrase = 'File name   :  '
    index = check_str.find(search_phrase)  # gives us the index to start from
    # now look for the index of when it switches to the next line
    index_end = check_str.find('\n', index + 1)
    # now get the file name by grabbing between these index values
    body['remote_info'] = check_str[index + len(search_phrase):index_end - 2]

    # now go through the process to get the ephemeris information
    child.sendline('E')
    child.expect(': ')
    child.sendline('v')
    child.expect(': ')
    if bodies.index(body) == 0:
        child.sendline('@sun')  # setting the sun as the reference frame
    else:
        child.sendline('y')  # telling the api to use previous center
    child.expect(': ')
    child.sendline('eclip')
    child.expect(': ')
    child.sendline(start_date)
    child.expect(': ')
    child.sendline(end_date)
    child.expect(': ')
    child.sendline('10m')  # sending interval of collection
    child.expect(': ')
    child.sendline('y')
    child.expect('Select...')
    child.sendline('Ftp')  # store this file in the jpl server remotely to pull down
    child.expect('Select...')
    # grab file name from the last child output
    check_str = str(child.before)
    search_phrase = 'File name   :  '
    index = check_str.find(search_phrase)  # gives us the index to start from
    # now look for the index of when it switches to the next line
    index_end = check_str.find('\n', index + 1)
    # now get the file name by grabbing between these index values
    body['remote_eph'] = check_str[index + len(search_phrase):index_end - 2]

    # now prepare the console for another round of info grabbing
    child.sendline('New-case')
    child.expect('Horizons> ')

child.close()

print('Done with finding info...')

# now look to populating these files into our local folders
local_eph = '/Users/dwensberg/Desktop/development/solarsystem/src/ephemeris/'
local_info = '/Users/dwensberg/Desktop/development/solarsystem/src/info/'

machine_name = 'ssd.jpl.nasa.gov'
ftp_dir = '/pub/ssd/'
email_address = 'dana.wensberg@gmail.com'

# create new pexpect object and open it to the ftp to pull down files
grab = pexpect.spawn('ftp ' + machine_name)
grab.expect('Name ')
grab.sendline('ftp')
grab.expect('Password:')
grab.sendline(email_address)
grab.expect('ftp> ')
grab.sendline('lcd ' + local_info)
grab.expect('ftp> ')
grab.sendline('cd ' + ftp_dir)
grab.expect('ftp> ')

# loop through the bodies and pull down the files, first info, and then ephemeris
for body in bodies:
    grab.sendline('get ' + body['remote_info'] + ' ' + body['local'])
    grab.expect('ftp> ')

# now move the local directory to the ephemeris folder and pull down in a loop again
grab.sendline('lcd ' + local_eph)
grab.expect('ftp> ')
for body in bodies:
    grab.sendline('get ' + body['remote_eph'] + ' ' + body['local'])
    grab.expect('ftp> ')

#should have all information populated into the two local folders, so now kill the ftp
grab.close()

print('Done with pulling info down...')

print('')
print('Total time: ' + str(time.time() - st))
