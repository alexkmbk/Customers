﻿using System;
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
    public class CustomersController : Controller
    {
        // Контекст Entity Framework
        private readonly ApplicationDbContext _ctx;
  
        public CustomersController(ApplicationDbContext ctx)
        {
            _ctx = ctx;
         }

        private List<Customer> GetCustomers()
        {
 
            // Получаем данные из БД с помощью ORM Dapper
            NpgsqlConnection cn = new NpgsqlConnection("Server=127.0.0.1;Port=5432;Database=Customers;User Id=postgres;Password=123;MaxPoolSize=100;");
            cn.Open();
            // Данные получаются левым соединением сразу из двух таблиц, используется маппинг сразу в два типа: Customer и BusinessType 
            var res = cn.Query<Customer, BusinessType, Customer>("select * from \"Customer\" as \"Customer\" left join \"BusinessType\" as \"BusinessType\" on \"Customer\".\"BusinessTypeBusinessTypeId\" = \"BusinessType\".\"BusinessTypeId\" order by  \"Customer\".\"CustomerName\"", (customer, businessType)=> { customer.BusinessType = businessType; return customer; }, splitOn: "BusinessTypeId");
 
             return (List<Customer>)res;
        }

        // Список Customers
        // GET: /<controller>/
        public IActionResult Index(bool ajax)
        {
            ViewBag.Title = "Customers";
            ViewBag.BusinessTypes = (from type in _ctx.BusinessTypes
                                     select type).ToList();
            if (ajax)
                return Json(new { view = RenderPartialViewToString("CustomersIndex", GetCustomers()) });
            else
                return View("CustomersIndex", GetCustomers());
        }

        // Список BankAccounts
        // GET: /<controller>/
        public IActionResult BankAccounts()
        {
            ViewBag.Title = "Счета контрагентов";

            var BankAccounts = from row in _ctx.BankAccounts
                               select new BankAccount
                               {
                                   BankAccountId = row.BankAccountId,
                                   BankAccountNumber = row.BankAccountNumber,
                                   Customer = new Customer { CustomerId = row.Customer.CustomerId, CustomerName = row.Customer.CustomerName },
                                   Bank = new Bank { BankId = row.Bank.BankId, BankName = row.Bank.BankName }
                               };
            
            return Json(new {view = RenderPartialViewToString("_BankAccounts_view", BankAccounts) });
        }

        // Возвращает список BankAccounts для редактирования
        [HttpGet]
        public IActionResult GetBankAccountsForEdit(int CustomerId)
        {
            ViewBag.Title = "Счета контрагента";
            ViewBag.CustomerId = CustomerId;
            var BankAccounts = from row in _ctx.BankAccounts
                               where (row.Customer.CustomerId == CustomerId)
                               select new BankAccount { BankAccountId = row.BankAccountId, BankAccountNumber = row.BankAccountNumber,
                                   Customer = new Customer { CustomerId = row.Customer.CustomerId, CustomerName = row.Customer.CustomerName },
                                   Bank = new Bank { BankId = row.Bank.BankId, BankName = row.Bank.BankName } };
            var BankAccounts_edit = RenderPartialViewToString("_BankAccounts_edit", BankAccounts);
            return Json(new { isOk = true, Errors = "", view = BankAccounts_edit });
        }

        // Возвращает список банков для выбора при вводе построке
        [HttpGet]
        public IActionResult GetAutocompleteBankList(string term)
        {

            var banks = _ctx.Banks
                    .Where(x => x.BankName.ToLower().Contains(term.ToLower()))
                    .OrderBy(x => x.BankName)
                    .Select(x => new { label = x.BankName + "("+ x.BIC + ")", value = x.BankName, Id = x.BankId })
                    .ToList();
            return Json(banks);
        }


        // Форма BankAccount
        // GET: /<controller>/
        public IActionResult BankAccount(int Id)
        {
            ViewBag.Title = "Счет контрагента";
            return View(_ctx.Banks.FirstOrDefault(e => e.BankId == Id));
        }

        // Список Banks
        // GET: /<controller>/
        public IActionResult Banks()
        {
            ViewBag.Title = "Банки";
            return View("BanksIndex", _ctx.Banks.ToList());
        }

        // Добавление банка
        [HttpPost]
        [Authorize]
        public IActionResult AddBank(string BankName, string BIC)
        {
            Bank newBank = new Bank();
            if (_ctx.Banks.FirstOrDefault(e => e.BIC == BIC) != null)
            {
                return Json(new { isOk = false, Errors = $"The Bank with the BIC '{BIC}' already exists" });
            }
            newBank.BankName = BankName;
            newBank.BIC = BIC;
            _ctx.Banks.Add(newBank);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
            // Возвращаем результат в виде JSON структуры, в параметре view передается html обновленной таблицы
            // контрагентов в виде строки
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_CustomersTable", GetCustomers()), BankId = newBank.BankId });

            return View("BanksIndex", _ctx.Banks.ToList());
        }

        // Обнровление свойств банка
        [HttpPost]
        [Authorize]
        public IActionResult UpdateBank(string BankName, string BIC, int BankId)
        {
            Bank bank = new Bank();

            bank = _ctx.Banks.FirstOrDefault(e => e.BankId == BankId);
            if (bank == null)
            {
                return Json(new { isOk = false, Errors = "Не удалось получить банк по ID" });
            }

            bank.BankName = BankName;
            bank.BIC = BIC;
            _ctx.Banks.Update(bank);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
            // Возвращаем результат в виде JSON структуры, в параметре view передается html обновленной таблицы
            // контрагентов в виде строки
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_BanksTable", _ctx.Banks.ToList()), BankId = bank.BankId });
        }

        [HttpPost]
        [Authorize]
        public IActionResult DeleteBank(int BankId)
        {
            Bank bank = new Bank();

            bank = _ctx.Banks.FirstOrDefault(e => e.BankId == BankId);
            if (bank == null)
            {
                return Json(new { isOk = false, Errors = "Не удалось получить банк по ID" });
            }

             _ctx.Banks.Remove(bank);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
            // Возвращаем результат в виде JSON структуры, в параметре view передается html обновленной таблицы
            // контрагентов в виде строки
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_BanksTable", _ctx.Banks.ToList()), BankId = bank.BankId });
        }

        // Форма выбора банков
        [HttpGet]
        public IActionResult GetBanksChoiceForm()
        {
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("BankChoiceForm", _ctx.Banks.ToList()) });
        }

        // Загрузка банков из файлов Excel
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

                        // Отберем для добавления только те банки, БИК-ки которых еще не содежатся в базе
                        var banks = data.Tables["Page1$"].Select().Where(p => !_ctx.Banks.Any(p2 => p2.BIC == p["BIC"].ToString()));

                        // альтернативный запрос с аналогичным функционалом
                        /*var banks = from newbank in data.Tables["Page1$"].Select()
                                    where !(from b in _ctx.Banks
                                            select b.BIC)
                                            .Contains(newbank["BIC"].ToString())
                                            select newbank;*/

                        foreach (var e in banks)
                        {
                            _ctx.Banks.Add(new Bank{BankName= e["Name"].ToString(), BIC= e["BIC"].ToString() });  
                        }

                    };
                }
                _ctx.SaveChanges();
            }


            return View("_Banks", _ctx.Banks.ToList());
        }

        // Удаление записи о контрагенте по переданному ID
        [HttpGet]
        [Authorize]
        public IActionResult Delete(int CustomerId)
        {
            var entity = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (entity != null)
            {
                var accounts = _ctx.BankAccounts.Where(e => e.Customer.CustomerId == CustomerId);
                _ctx.RemoveRange(accounts);
                _ctx.Remove(entity);
                _ctx.SaveChanges();

            }
            ViewBag.Title = "Customers";
            ViewBag.BusinessTypes = (from type in _ctx.BusinessTypes
                                     select type).ToList();
            return View("CustomersIndex", GetCustomers());
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
            return Json(new { isOk = true, Errors = "", view= RenderPartialViewToString("_CustomersTable", GetCustomers()), CustomerId = customer.CustomerId });
            
        }

        [HttpPost]
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
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_CustomersTable", GetCustomers()) });

        }

        // Добавляет новый счет
        [HttpPost]
        public IActionResult AddBankAccount(string BankAccountNumber, int BankId, int CustomerId)
        {
            var bank = _ctx.Banks.FirstOrDefault(e => e.BankId == BankId);
            if (bank == null)
            {
                return Json(new { isOk = false, Errors = "Не найден указанный банк" });
            }
            BankAccount bankAccount = new BankAccount();
            if (_ctx.BankAccounts.FirstOrDefault(e => e.BankAccountNumber == BankAccountNumber) != null)
            {
                return Json(new { isOk = false, Errors = $"Счет с номером '{BankAccountNumber}' уже существует" });
            }
            var customer = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (customer == null)
            {
                return Json(new { isOk = false, Errors = "Не найден контрагент" });
            }
            bankAccount.BankAccountNumber = BankAccountNumber;
            bankAccount.Bank = bank;
            bankAccount.Customer = customer;
            _ctx.BankAccounts.Add(bankAccount);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;

            return Json(new { isOk = true, Errors = "", BankAccountId = bankAccount.BankAccountId });

        }

        // Обновляет данные счета
        [HttpPost]
        public IActionResult UpdateBankAccount(int BankAccountId, string BankAccountNumber, int BankId, int CustomerId)
        {
            var bank = _ctx.Banks.FirstOrDefault(e => e.BankId == BankId);
            if (bank == null)
            {
                return Json(new { isOk = false, Errors = "Не найден указанный банк" });
            }
            BankAccount bankAccount = _ctx.BankAccounts.FirstOrDefault(e => e.BankAccountId == BankAccountId);
            if (bankAccount == null)
            {
                return Json(new { isOk = false, Errors = $"Не найден счет по переданному Id - {BankAccountId}" });
            }
            var customer = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (customer == null)
            {
                return Json(new { isOk = false, Errors = "Не найден контрагент" });
            }
            bankAccount.BankAccountNumber = BankAccountNumber;
            bankAccount.Bank = bank;
            bankAccount.Customer = customer;
            _ctx.Update(bankAccount);
            _ctx.SaveChanges();

            // Возвращаем результат в виде JSON структуры, в параметре view передается html обновленной таблицы
            // контрагентов в виде строки
            return Json(new { isOk = true, Errors = "" });

        }

        // Удаляет счет
        [HttpPost]
        public IActionResult DeleteBankAccount(int BankAccountId)
        {
    
            BankAccount bankAccount = _ctx.BankAccounts.FirstOrDefault(e => e.BankAccountId == BankAccountId);
            if (bankAccount == null)
            {
                return Json(new { isOk = false, Errors = $"Не найден счет" });
            }
 
            _ctx.BankAccounts.Remove(bankAccount);
            _ctx.SaveChanges();

            Response.StatusCode = (int)System.Net.HttpStatusCode.OK;
            // Возвращаем результат в виде JSON структуры, в параметре view передается html обновленной таблицы
            // контрагентов в виде строки
            return Json(new { isOk = true, Errors = "" });

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
