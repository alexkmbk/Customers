using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Customers.Models;

namespace Customers.Controllers
{
    // Класс для инициализации данных в БД при первом запуске
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
            // Получаем из таблицы BusinessTypes уже существующие записи с наименованием "Физ. лицо"
            var businesstypes = from bt in _ctx.BusinessTypes
                                where bt.BusinessTypeName == "Физ. лицо"
                                select bt;

            // Если записи "Физ. лицо" еще нет, значит еще не добавляли, 
            // поэтому добавляем в базу записи "Физ. лицо" и "Юр. лицо" 
            if (businesstypes.Count() == 0)
            {
                _ctx.BusinessTypes.Add(new BusinessType { BusinessTypeName = "Физ. лицо" });
                _ctx.BusinessTypes.Add(new BusinessType { BusinessTypeName = "Юр. лицо" });
                _ctx.SaveChanges();
            }

        }
    }

}
