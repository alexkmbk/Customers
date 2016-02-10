using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Customers.Models
{
    // Модель данных для хранения сведений о контрагентах и их типе (физ. лицо или юр. лицо)
    public class Customer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public virtual BusinessType BusinessType { get; set; }
    }

    public class BusinessType
    {
        public int BusinessTypeId { get; set; }
        public string BusinessTypeName { get; set; }
        public virtual ICollection<Customer> Customers { get; set; }
    }

}
