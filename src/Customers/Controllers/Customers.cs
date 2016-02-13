using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Authorization;
using Customers.Models;
using System.IO;
using Microsoft.AspNet.Mvc.ViewEngines;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.AspNet.Mvc.ViewFeatures;
using Microsoft.Data.Entity;
using Npgsql;
using Dapper;
using Microsoft.AspNet.Http;
using Microsoft.Net.Http.Headers;

using System.IO;
using System.Data;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Customers.Controllers
{
    public class Customers : Controller
    {
        // Контекст Entity Framework
        private readonly ApplicationDbContext _ctx;
  
        public Customers(ApplicationDbContext ctx)
        {
            _ctx = ctx;
         }

        private List<Customer> GetCustomers()
        {
 
            // Получаем данные из БД с помощью ORM Dapper
            NpgsqlConnection cn = new NpgsqlConnection("Server=127.0.0.1;Port=5432;Database=Customers;User Id=postgres;Password=123;MaxPoolSize=100;");
            cn.Open();
            // Данные получаются левым соединением сразу из двух таблиц, используется маппинг сразу в два типа: Customer и BusinessType 
            var res = cn.Query<Customer, BusinessType, Customer>("select * from \"Customer\" as \"Customer\" left join \"BusinessType\" as \"BusinessType\" on \"Customer\".\"BusinessTypeBusinessTypeId\" = \"BusinessType\".\"BusinessTypeId\"", (customer, businessType)=> { customer.BusinessType = businessType; return customer; }, splitOn: "BusinessTypeId");
 
             return (List<Customer>)res;
        }

        // Список Customers
        // GET: /<controller>/
        public IActionResult Index()
        {
            ViewBag.Title = "Customers";
            ViewBag.BusinessTypes = (from type in _ctx.BusinessTypes
                                     select type).ToList();
            return View("Index", GetCustomers());
        }

        // Список BankAccounts
        // GET: /<controller>/
        public IActionResult BankAccounts()
        {
            ViewBag.Title = "Счета контрагентов";
            return View("_BankAccounts", _ctx.BankAccounts.ToList());
        }

        // Список Banks
        // GET: /<controller>/
        public IActionResult Banks()
        {
            ViewBag.Title = "Банки";
            return View("_Banks", _ctx.Banks.ToList());
        }

        // Список Banks
        [HttpPost]
        public IActionResult UploadBanks(ICollection<IFormFile> files)
        {

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var stream = file.OpenReadStream();
                    {

                        var tmpFilePath = Path.GetTempFileName();
                        file.SaveAs(tmpFilePath);
                        var data = common.LoadExcel(tmpFilePath);
                        System.IO.File.Delete(tmpFilePath);
                        DataTable products = data.Tables["Page1$"];

                        var banks = data.Tables["Page1$"].Select().Where(p => !_ctx.Banks.Any(p2 => p2.BankName == p["BIC"].ToString()));

                        foreach (var e in banks)
                        {
                            _ctx.Banks.Add(new Bank{BankName= e["Name"].ToString(), BIC= e["BIC"].ToString() });  
                        }

                    };
                }
                //_ctx.SaveChanges();
            }


            return View("_Banks", _ctx.Banks.ToList());
        }

        // Удаление записи о контрагенте по переданному ID
        [HttpPost]
        [Authorize]
        public IActionResult Delete(int CustomerId)
        {

            var entity = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (entity != null)
            {
                _ctx.Remove(entity);
                _ctx.SaveChanges();

            }
            ViewBag.Title = "Customers";
            ViewBag.BusinessTypes = (from type in _ctx.BusinessTypes
                                     select type).ToList();
            return View("Index", GetCustomers());
        }

        [HttpPost]
        [Authorize]
        public IActionResult Add(string CustomerName, string BusinessTypeName)
        {
            var businessType = _ctx.BusinessTypes.FirstOrDefault(e => e.BusinessTypeName == BusinessTypeName);
            if (businessType == null)
            {
                return Json(new {isOk=false, Errors = "Не удалось получить BusinessType" });
            }
            Customer customer = new Customer();
            if (_ctx.Customers.FirstOrDefault(e => e.CustomerName == CustomerName) != null)
            {
                return Json(new { isOk = false, Errors = $"The Customer with name '{CustomerName}' already exists" });
            }
            customer.CustomerName = CustomerName;
            customer.BusinessType = businessType;
            _ctx.Customers.Add(customer);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
            // Возвращаем результат в виде JSON структуры, в параметре view передается html обновленной таблицы
            // контрагентов в виде строки
            return Json(new { isOk = true, Errors = "", view= RenderPartialViewToString("_table", GetCustomers())});
            
        }

        [HttpPost]
        [Authorize]
        // Обновление данных контрагента
        public IActionResult Update(int CustomerId, string CustomerName, string BusinessTypeName)
        {
            var businessType = _ctx.BusinessTypes.FirstOrDefault(e => e.BusinessTypeName == BusinessTypeName);
            if (businessType == null)
            {
                return Json(new { isOk = false, Errors = "Не удалось получить BusinessType" });
            }

            Customer customer = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (customer == null)
            {
                return Json(new { isOk = false, Errors = "Не удалось получить Контрагента по ID" });
            }
            customer.CustomerName = CustomerName;
            customer.BusinessType = businessType;
            _ctx.Customers.Update(customer);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_table", GetCustomers()) });

        }

        // Функция для формирования html кода по переданному шаблону вида и модели
        // результат возвращается в виде строки
        // это позволяет передавать готовый html код в ответ на ajax запросы с клиента
        public string RenderPartialViewToString(string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = ActionContext.ActionDescriptor.Name;

            ViewData.Model = model;

            using (StringWriter sw = new StringWriter())
            {
                var engine = Resolver.GetService(typeof(ICompositeViewEngine)) as ICompositeViewEngine;
                ViewEngineResult viewResult = engine.FindPartialView(ActionContext, viewName);

                ViewContext viewContext = new ViewContext(ActionContext, viewResult.View, ViewData, TempData, sw, new HtmlHelperOptions());

                var t = viewResult.View.RenderAsync(viewContext);
                t.Wait();

                return sw.GetStringBuilder().ToString();
            }
        }
    }


}
