using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Customers.Models;

namespace Customers.Controllers
{
    public class DataInitializer
    {
        private ApplicationDbContext _ctx;

        //private RoleManager<AppRole> _roleManager;

        public DataInitializer(ApplicationDbContext ctx)
        {
            _ctx = ctx;

        }

        public void InitializeData()
        {
            var businesstypes = from bt in _ctx.BusinessTypes
                                where bt.BusinessTypeName == "Физ. лицо"
                                select bt;

            if (businesstypes.Count() == 0)
            {
                _ctx.BusinessTypes.Add(new BusinessType { BusinessTypeName = "Физ. лицо" });
                _ctx.BusinessTypes.Add(new BusinessType { BusinessTypeName = "Юр. лицо" });
                _ctx.SaveChanges();
            }

        }
    }

}
