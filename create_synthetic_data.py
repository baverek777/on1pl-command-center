import pandas as pd
import random

# Seed for reproducibility
random.seed(42)

# Sample Data
female_names = ["Anna", "Maria", "Katarzyna", "Małgorzata", "Agnieszka", "Krystyna", "Barbara", "Ewa", "Elżbieta", "Zofia", "Beata", "Dorota", "Joanna", "Marta", "Karolina"]
male_names = ["Piotr", "Krzysztof", "Andrzej", "Tomasz", "Jan", "Paweł", "Michał", "Marcin", "Stanisław", "Jakub", "Adam", "Marek", "Łukasz", "Grzegorz", "Wojciech"]
surnames = ["Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Wojciechowski", "Kwiatkowski", "Krawczyk", "Kaczmarek", "Piotrowski", "Grabowski", "Pawłowski", "Michalski", "Król", "Wieczorek", "Jabłoński", "Wróbel", "Nowakowski", "Majewski", "Olszewski", "Stępień", "Malinowski", "Jaworski", "Adamczyk", "Dudek", "Nowicki", "Pawlak", "Górski", "Witkowski", "Sikora", "Walczak", "Baran", "Rutkowski", "Michalak", "Szewczyk", "Ostrowski", "Tomaszewski", "Pietrzak", "Zalewski", "Wróblewski", "Marciniak", "Jasiński", "Zawadzki", "Bąk", "Jakubowski", "Sadowski", "Duda", "Włodarczyk", "Wilk", "Chmielewski", "Borkowski", "Sokołowski", "Szczepański", "Sawicki", "Kucharski", "Lis", "Maciejewski", "Mazurek", "Kubiński", "Kalinowski", "Wysocki", "Czarnecki", "Kołodziej", "Urbański", "Sobczak", "Konieczny", "Głowacki", "Wasilewski", "Sikorski", "Zakrzewski", "Krajewski", "Krupa", "Laskowski", "Ziółkowski", "Gajewski", "Mróz", "Brzeziński", "Szulc", "Kamil", "Makowski", "Przybylski", "Kania"]

# Ensure some B names for filtering
b_surnames = ["Baran", "Bąk", "Borkowski", "Brzeziński", "Banaszek", "Bednarek", "Białek", "Błaszczyk"]
surnames.extend(b_surnames)

genders = ["K", "M"]
gimnazja = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
languages = ["angielski", "niemiecki", "rosyjski", "francuski"]
classes = ["1A", "1B", "1C", "1D"]
accepted = ["T", "N"]

data = []
for _ in range(165):
    gender = random.choice(genders)
    if gender == "K":
        first_name = random.choice(female_names)
    else:
        first_name = random.choice(male_names)
    
    last_name = random.choice(surnames)
    
    gimnazjum = random.choice(gimnazja)
    
    # Scores 0-50
    egz_h = random.randint(10, 50)
    egz_m = random.randint(10, 50)
    egz_je = random.randint(10, 50) # Exam foreign language
    egz_jp = random.randint(10, 50) # Exam polish
    
    klasa = random.choice(classes)
    po_klasie = random.choice(accepted)
    lang = random.choice(languages)
    
    data.append({
        "Imię": first_name,
        "Nazwisko": last_name,
        "Płeć": gender,
        "Gimnazjum": gimnazjum,
        "Egz. h": egz_h,
        "Egz. m": egz_m,
        "Egz. je": egz_je,
        "Egz. jp": egz_jp,
        "Klasa": klasa,
        "Przyjęty do klasy": po_klasie,
        "Pierwszy język": lang
    })

df = pd.DataFrame(data)

# Save to Excel
df.to_excel("V.16.1 Rekrutacja.xlsx", index=False)
print("Synthetic data saved to V.16.1 Rekrutacja.xlsx")
