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