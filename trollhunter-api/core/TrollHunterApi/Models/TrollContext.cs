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
using System.Linq;
using System;

namespace TrollHunterApi.Models
{
    public static class TrollContext
    {
        private static Dictionary<int, Troll> trolls = new Dictionary<int, Troll>();
        private static int currentTrollId = 0;

        public static void AddTroll(Troll t) {
            var user = UserContext.GetUser(t.OwnerId);
            if(user != null) {
                t.TrollId = currentTrollId;
                currentTrollId++;
                trolls.Add(t.TrollId, t);
                user.AddTroll(t);
            }
        }

        public static Troll GetTroll(int id) {
            if(!trolls.ContainsKey(id))
                return null;
            return trolls[id];
        }

        public static void DeleteTroll(int trollId) {
            lock(trolls) {
                if(trolls != null && trolls.ContainsKey(trollId))
                    trolls.Remove(trollId);
            }
        }
    }
}