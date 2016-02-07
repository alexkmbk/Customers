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

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Customers.Controllers
{
    public class Customers : Controller
    {
        private readonly ApplicationDbContext _ctx;

        public Customers(ApplicationDbContext ctx)
        {
            _ctx = ctx;
        }

        private List<Customer> GetCustomers()
        {
            /*List<Customer> res = (from cust in _ctx.Customers
                                 select cust).ToList();*/

            List<Customer> res = _ctx.Customers.ToList();

            /*List<Customer> res = from cust in _ctx.Customers
                                 join type in _ctx.BusinessTypes on cust.BusinessType equals type.BusinessTypeId into gj
                                 select new Customer({ CustomerId = cust.CustomerId, CustomerName = cust.CustomerName, PetName = (subpet == null ? String.Empty : subpet.Name) });*/
            return res;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            ViewBag.Title = "Customers";
            ViewBag.BusinessTypes = (from type in _ctx.BusinessTypes
                                     select type).ToList();
            return View("Index", GetCustomers());
        }

        [HttpPost]
        [Authorize]
        public IActionResult Delete(int CustomerId)
        {

            var entity = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (entity != null)
            {
                // Remove Entity
                //_ctx.Customers.Attach(entity);
                //_ctx.Customers.Remove(entity);
                //_ctx.Entry(entity).State = EntityState.Deleted;
                _ctx.Remove(entity);
                _ctx.SaveChanges();

            }
            var cust =  GetCustomers();
            return View("Index", cust);
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
            return Json(new { isOk = true, Errors = "", view= RenderPartialViewToString("_table", GetCustomers())});
            
        }

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
