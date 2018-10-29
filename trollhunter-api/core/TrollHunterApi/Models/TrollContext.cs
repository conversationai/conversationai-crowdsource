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