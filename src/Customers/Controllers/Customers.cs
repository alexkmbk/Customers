using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

using Customers.Models;

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
            List<Customer> res = (from cust in _ctx.Customers
                                 select cust).ToList();
            return res;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            ViewBag.Title = "Customers";
            ViewBag.BusinessTypes = (from type in _ctx.BusinessTypes
                                     select type).ToList();
            return View(GetCustomers());
        }

        public IActionResult Delete(int CustomerId)
        {

            var entity = _ctx.Customers.FirstOrDefault(e => e.CustomerId == CustomerId);
            if (entity != null)
            {
                // Remove Entity
                _ctx.Customers.Remove(entity);
                _ctx.SaveChanges();
            }

            return View("Index", GetCustomers());
        }
    }
}
