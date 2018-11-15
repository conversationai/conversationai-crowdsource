
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
    public class Troll {
        public string OwnerId;
        public string Name;
        public int Health;
        public int Experience = 0;
        public int TrollId;

        public int Level => levels.FindIndex(x => x > this.Experience) - 1;

        public int NextLevelXp => levels.Find(x => x > this.Experience) - this.Experience;

        // Feed result can help indicate to the calling method if any
        // actions should be taken...  TODO
        public FeedResult Feed(string comment) {
            int prevLevel = this.Level;
            Experience += 10;
            return (this.Level > prevLevel) ? FeedResult.LEVELUP : FeedResult.NONE;
        }

        public static List<int> levels = new List<int> {
            0,
            30,
            100,
            300,
            900,
            3000,
            9000,
            30000,
            90000
        };
    }

    public enum FeedResult {
        NONE,
        LEVELUP
    }
}