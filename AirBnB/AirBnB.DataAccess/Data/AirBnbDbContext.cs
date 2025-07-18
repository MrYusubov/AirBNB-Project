﻿using AirBnB.Entites.Concrete;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.DataAccess.Data
{
    public class AirBnbDbContext : IdentityDbContext<CustomIdentityUser, CustomIdentityRole, string>
    {
        public AirBnbDbContext(DbContextOptions<AirBnbDbContext> options)
            : base(options)
        {
        }
        public AirBnbDbContext() { }

        public DbSet<House> House { get; set; }
        public DbSet<HouseCategory> HouseCategory { get; set; }
        public DbSet<Booking> Booking { get; set; }
        public DbSet<Review> Review { get; set; }
        public DbSet<Favorite> Favorite { get; set; }
        public DbSet<DynamicPricing> DynamicPricing { get; set; }
        public DbSet<Message> Message { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=AirBnB;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False");
            }
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<House>()
                .HasMany<Review>(h => h.Reviews)
                .WithOne(r => r.House)
                .HasForeignKey(r => r.HouseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<House>()
                .HasMany<Favorite>(h => h.Favorites)
                .WithOne(f => f.House)
                .HasForeignKey(f => f.HouseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<House>()
                .HasMany<Booking>(h => h.Bookings)
                .WithOne(b => b.House)
                .HasForeignKey(b => b.HouseId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<House>()
                .Property(h => h.ImageUrl)
                .HasConversion(
                    v => string.Join(",", v),
                    v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()
                );
        }
    }
}
