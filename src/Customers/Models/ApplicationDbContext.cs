﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata;

namespace Customers.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        // В базе данных, кроме стандартных сведений о пользователях,
        // будет 2 таблицы, Customers и BusinessTypes, связанных связью один ко многим
        public DbSet<Customer> Customers { get; set; }
        public DbSet<BusinessType> BusinessTypes { get; set; }
        public DbSet<BankAccount> BankAccounts { get; set; }
        public DbSet<Bank> Banks { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            /*foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }*/

            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
        }
        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            //options.UseSqlServer(@"Server=(localdb)\\MSSQLLocalDB;Database=_CHANGE_ME;Trusted_Connection=True;");
            // Строка подключения к серверу БК Postgre SQL
            options.UseNpgsql(@"Server=127.0.0.1;Port=5432;Database=Customers;Integrated Security=true;User Id=postgres;Password=123;");
        }
    }
}
