using AirBnB.Business.Abstract;
using AirBnB.Business.Concrete;
using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Hubs;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("https://localhost:56420")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});
// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var conn = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AirBnbDbContext>(options => 
options.UseSqlServer(conn));

builder.Services.AddSignalR(options => {
    options.EnableDetailedErrors = true;
});


builder.Services.AddIdentity<CustomIdentityUser, CustomIdentityRole>()
    .AddEntityFrameworkStores<AirBnbDbContext>()
.AddDefaultTokenProviders();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = "GOOGLE_CLIENT_ID";
        options.ClientSecret = "GOOGLE_CLIENT_SECRET";
        options.CallbackPath = "/signin-google";
    })
    .AddFacebook(options =>
    {
        options.AppId = "FACEBOOK_APP_ID";
        options.AppSecret = "FACEBOOK_APP_SECRET";
        options.CallbackPath = "/signin-facebook";
    })
    .AddGitHub(options =>
    {
        options.ClientId = "GITHUB_CLIENT_ID";
        options.ClientSecret = "GITHUB_CLIENT_SECRET";
        options.CallbackPath = "/signin-github";
        options.Scope.Add("user:email");
    });


var app = builder.Build();
app.UseCors("AllowReactApp");


app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chatHub");


app.MapFallbackToFile("/index.html");

app.Run();
