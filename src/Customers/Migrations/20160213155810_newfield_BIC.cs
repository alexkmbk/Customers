using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;

namespace Customers.Migrations
{
    public partial class newfield_BIC : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BIC",
                table: "Bank",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "BIC", table: "Bank");
        }
    }
}
