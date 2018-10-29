using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TrollHunterApi.Models;

namespace TrollHunterApi
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc()
                    .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            ModelFactory.PopulateFakeData(); // TODO remove this eventually
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseMvc();
        }
    }
}