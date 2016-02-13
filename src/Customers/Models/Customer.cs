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
        public virtual ICollection<Customer> BankAccounts { get; set; }
    }

    public class BusinessType
    {
        public int BusinessTypeId { get; set; }
        public string BusinessTypeName { get; set; }
        public virtual ICollection<Customer> Customers { get; set; }
    }

    public class BankAccount
    {
        public int BankAccountId { get; set; }
        public string BankAccountNumber { get; set; }
        public virtual Customer Customer { get; set; }
        public virtual Bank Bank { get; set; }
    }

    public class Bank
    {
        public int BankId { get; set; }
        public string BankName { get; set; }
        public string BIC { get; set; }
    }
}
