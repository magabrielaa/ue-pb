import random
import json
import pandas as pd
import csv

#################### Run Simulation #################################

n = 5
budget = 1000000

def shuffle_options(options):
    '''
    Given a list of budget options, it shuffles the items on the list.
    Input: options (list)
    Output: shuffled options (list)
    '''
    random.shuffle(options)
    return options

def simulate_vote(options):
    '''
    Simulates a single vote of budget allocations across a given set of options.
    Output: dictionary where the key is the option and the value is the allocated amount in $
    '''

    remainder = budget
    allocations = {}

    for option in options[:-1]:
        amount = round(random.random() * remainder)
        remainder -= amount
        allocations[option] = amount
    
    # Assign remainder of budget to last item on the list
    allocations[options[-1]] = budget - sum(allocations.values())
        
    # Allocate remainder to n item
    return allocations

def gen_ward_sim(num_simulations, ward_number):
    '''
    Generates a complete simulation of votes for a given ward.
    Input: number of simulations required (int)
           ward number (string)
    Output: file with budget allocations for a ward (JSON)
    '''
    # Assign high and low priority budget items per ward, for more realistic 
    # voting simulations
    if ward_number == "29":
        high_priority = ["Biking and Transport", "Libraries and Schools", "Parks and Environment"]
        low_priority = ["Streets and Sidewalks","Arts and Culture"]
        shuffled_high = shuffle_options(high_priority)
        shuffled_low = shuffle_options(low_priority)
        options = shuffled_high + shuffled_low
    elif ward_number == "35":
        high_priority = ["Arts and Culture", "Libraries and Schools"]
        low_priority = ["Biking and Transport", "Parks and Environment", "Streets and Sidewalks"]
        shuffled_high = shuffle_options(high_priority)
        shuffled_low = shuffle_options(low_priority)
        options = shuffled_high + shuffled_low
    elif ward_number == "36":
        high_priority = ["Streets and Sidewalks", "Biking and Transport", "Arts and Culture"]
        low_priority = ["Parks and Environment", "Libraries and Schools"]
        shuffled_high = shuffle_options(high_priority)
        shuffled_low = shuffle_options(low_priority)
        options = shuffled_high + shuffled_low
    elif ward_number == "49":
        high_priority = ["Libraries and Schools", "Parks and Environment"]
        low_priority = ["Streets and Sidewalks","Biking and Transport", "Arts and Culture"]
        shuffled_high = shuffle_options(high_priority)
        shuffled_low = shuffle_options(low_priority)
        options = shuffled_high + shuffled_low

    results = []

    for i in range(num_simulations):
        allocation = simulate_vote(options)
        results.append(allocation)

    with open(f'simulation_ward{ward_number}.json', 'w') as f:
        json.dump(results, f)


# Create a dict with a number of simulations per ward
# num_simulations = {"29": 2893, "35": 3120, "36": 2591, "49": 3642}
num_simulations = {"29": 28, "35": 31, "36": 25, "49": 36}

# Run simulations for all four wards
for key, val in num_simulations.items():
    gen_ward_sim(val, key)


######################### Convert to csv files ##############################

wards = ["29", "35", "36", "49"]

# Initialize list to hold data from all the wards
all_data = []

with open('allocation_simulation.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['ward', 'item', 'allocation'])  # Header row
    for w in wards:
        # Read the JSON data from a file
        with open(f'simulation_ward{w}.json', 'r') as json_file:
            data = json.load(json_file)

        # Write the data to the CSV file
        for item in data:
            for key, value in item.items():
                writer.writerow([w, key, value])

# for w in wards:
#     # Read the JSON data from a file
#     with open(f'simulation_ward{w}.json', 'r') as file:
#         data = json.load(file)

#     # Write the data to a CSV file
#     with open(f'simulation_ward{w}.csv', 'w', newline='') as file:
#         writer = csv.writer(file)
#         writer.writerow(['item', 'allocation'])  # Header row
#         for item in data:
#             for key, value in item.items():
#                 writer.writerow([key, value])
