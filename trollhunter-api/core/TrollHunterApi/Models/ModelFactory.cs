
/*
Copyright 2018 Google Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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