using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System;
using TrollHunterApi.Models;

namespace TrollHunterApi.Controllers
{
    [Route("api/feed")]
    [ApiController]
    public class FeedController : ControllerBase
    {
        [HttpGet("{id}")]
        public ActionResult<string> GetUserById(int id) //todo add comment
        {
            Troll t = TrollContext.GetTroll(id);
            if(t == null) 
                return "Oh no!  That troll doesn't exist!";
            var res = t.Feed("asdf"); //todo add comment

            //TODO add a 5 minute buffer or something

            if(res == FeedResult.LEVELUP) {
                return $"WOOOO {t.Name} Leveled up!  They are now level {t.Level}!";
            } else {
                return $"You fed {t.Name}!  They now have {t.Experience} experience, and need {t.NextLevelXp} to level up!";
            }
        }
    }
}
