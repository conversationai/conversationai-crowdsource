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

namespace TrollHunterApi.Models
{
    public static class UserContext
    {
        private static Dictionary<string, User> users = new Dictionary<string, User>();
        public static User GetUser(string userId) {
            if(!users.ContainsKey(userId))
                return null;
            return users[userId];
        }

        public static void AddUser(User user) {
            if(user == null)
                return;
            lock(users) {
                if(!users.ContainsKey(user.PlayStoreId))
                    users[user.PlayStoreId] = user;
            }
        }

        public static void DeleteUser(string userId) {
            lock(users) {
                if(users != null && users.ContainsKey(userId))
                    users.Remove(userId);
            }
        }

        public static List<User> GetAll() {
            return users.Values.ToList();
        }
    }
}