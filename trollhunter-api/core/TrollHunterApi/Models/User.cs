using System.Collections.Generic;

namespace TrollHunterApi.Models
{
    public class User {
        public string PlayStoreId;
        public HashSet<Troll> trolls = new HashSet<Troll>();

        public void AddTroll(Troll t) {
            if(!trolls.Contains(t))
                trolls.Add(t);
        }
    }
}