
using System.Collections.Generic;
using System;

namespace TrollHunterApi.Models
{
    // TODO model factory is used for demostration purposes, should be removed (as should all references to it)
    // once a long-lived data storage mechanism is set up.
    public static class ModelFactory {

        private static Random random;
        private static Random rand => random == null ? (random = new Random()) : random;
        
        public static void PopulateFakeData() {
            UserContext.AddUser(new User { PlayStoreId = "1" });
            UserContext.AddUser(new User { PlayStoreId = "2" });
            UserContext.AddUser(new User { PlayStoreId = "3" });
            TrollContext.AddTroll(CreateRandomTroll("1"));
            TrollContext.AddTroll(CreateRandomTroll("2"));
            TrollContext.AddTroll(CreateRandomTroll("2"));
            TrollContext.AddTroll(CreateRandomTroll("3"));
            TrollContext.AddTroll(CreateRandomTroll("3"));
            TrollContext.AddTroll(CreateRandomTroll("3"));
        }
        
        public static Troll CreateRandomTroll(string playerId) {
            // generate a random troll
            string fName = FirstNames[rand.Next(0, FirstNames.Count)];
            string lName = LastNames[rand.Next(0,LastNames.Count)];
            
            return new Troll() {
                Name = $"{fName} {lName}",
                Health = rand.Next(10,20),
                OwnerId = playerId
            };
        }

        private static List<string> FirstNames = new List<string>() {
            "Rharul",
            "Aelula",
            "Waho",
            "Jaah'mekan",
            "Lexohn",
            "Juthian",
            "Raan'deir",
            "Tzuker",
            "Kul'japa",
            "Ah'zu",
            "Khiez'dea",
            "Zuzre",
            "Hun'mo",
            "Fahseh",
            "Pie'zun",
            "Kedi",
            "Laehsun",
            "Zhisu",
            "Aznel'du",
            "Lujikre",
            "Se'mexza",
            "Rha'guxme",
            "Mowoz",
            "Odo",
            "Aar'ma",
            "Lur'naz",
            "Taz'se",
            "Suvoh",
            "Arush",
            "Pexugey"
        };

        private static List<string> LastNames = new List<string>() {
            "Rharul",
            "Aelula",
            "Waho",
            "Jaah'mekan",
            "Lexohn",
            "Juthian",
            "Raan'deir",
            "Tzuker",
            "Kul'japa",
            "Ah'zu",
            "Khiez'dea",
            "Zuzre",
            "Hun'mo",
            "Fahseh",
            "Pie'zun",
            "Kedi",
            "Laehsun",
            "Zhisu",
            "Aznel'du",
            "Lujikre",
            "Se'mexza",
            "Rha'guxme",
            "Mowoz",
            "Odo",
            "Aar'ma",
            "Lur'naz",
            "Taz'se",
            "Suvoh",
            "Arush",
            "Pexugey"
        };
    }
}