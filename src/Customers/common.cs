using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Authorization;
using Customers.Models;

namespace Customers
{
    static public class common
    {
        /*public static string RenderViewToString(string controllerName, string viewName, object viewModel)
        {
            HttpContextWrapper context = new HttpContextWrapper(HttpContext.Current);
            RouteData routeData = new System.Web.Routing.RouteData();
            routeData.Values.Add("controller", controllerName);
            ControllerContext controllerContext = new ControllerContext(context, routeData, new RenderController());


            RazorViewEngine razorViewEngine = new RazorViewEngine();
            ViewEngineResult razorViewResult = razorViewEngine.FindView(controllerContext, viewName, string.Empty, false);


            using (StringWriter writer = new StringWriter())
            {
                ViewDataDictionary viewData = new ViewDataDictionary(viewModel);
                var viewContext = new ViewContext(controllerContext, razorViewResult.View, viewData, new TempDataDictionary(), writer);
                razorViewResult.View.Render(viewContext, writer);
                writer.Flush();
                return writer.GetStringBuilder().ToString();
            }
        }*/
    }
}
