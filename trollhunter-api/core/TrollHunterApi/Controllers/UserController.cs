using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System;
using TrollHunterApi.Models;

namespace TrollHunterApi.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpGet]
        public ActionResult<List<User>> GetAll()
        {
            return UserContext.GetAll();
        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUserById(string id)
        {
            var item = UserContext.GetUser(id);
            if (item == null)
            {
                return NotFound();
            }
            return item;
        }
    }
}
