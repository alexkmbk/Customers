using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Dapper;
using Npgsql;

namespace Customers.Models
{
    public class DapperConnection
    {
        private NpgsqlConnection _cn;

        public DapperConnection()
        {
            _cn = new NpgsqlConnection("Server=127.0.0.1;Port=5432;Database=Customers;User Id=postgres;Password=123;MaxPoolSize=100;");

            _cn.Open();
            
        }


    }

    /*class Db : Database<Db>
    {
        public Table<Customer> Customers { get; set; }
        public Table<BusinessType> BusinessTypes { get; set; }
    }*/

}
