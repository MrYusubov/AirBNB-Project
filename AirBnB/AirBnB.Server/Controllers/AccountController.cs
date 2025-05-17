using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AirBnB.Business.Abstract;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

namespace AirBnB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<CustomIdentityUser> _userManager;
        private readonly RoleManager<CustomIdentityRole> _roleManager;
        private readonly SignInManager<CustomIdentityUser> _signInManager;
        private readonly IEmailService _emailService;

        public AccountController(UserManager<CustomIdentityUser> userManager,
            RoleManager<CustomIdentityRole> roleManager,
            SignInManager<CustomIdentityUser> signInManager,
            IEmailService emailService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (ModelState.IsValid)
            {
                var user = new CustomIdentityUser
                {
                    UserName = model.Username,
                    Email = model.Email,
                    EmailConfirmed = false,
                    EmailConfirmationToken = new Random().Next(100000, 999999).ToString()
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    var subject = "Your verification code";
                    var body = $"<h1>Your verification code: {user.EmailConfirmationToken}</h1>";
                    await _emailService.SendEmailAsync(user.Email, subject, body);

                    return Ok(new { message = "Verification code sent", email = user.Email });
                }

                return BadRequest(new { message = "Registration failed", errors = result.Errors });
            }

            return BadRequest(new { message = "Invalid data", errors = ModelState.Values });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberMe, false);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Login successful" });
                }

                return Unauthorized(new { message = "Invalid login attempt." });
            }

            return BadRequest(new { message = "Invalid data.", errors = ModelState.Values });
        }

        [HttpGet("check-auth")]
        public async Task<IActionResult> CheckAuth()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                return Ok(new
                {
                    isAuthenticated = true,
                    user = new
                    {
                        id=user.Id,
                        username = user.UserName,
                        email = user.Email,
                        profilePicture = user.ProfilePicture
                    }
                });
            }
            return Ok(new { isAuthenticated = false });
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }
            var profile = new ProfileDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                ProfilePicture = user.ProfilePicture
            };

            return Ok(profile);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out successfully" });
        }
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            user.UserName = model.Username;
            user.Email = model.Email;
            user.PhoneNumber = model.Phone ?? "0";

            if (!string.IsNullOrEmpty(model.ProfilePicture))
            {
                user.ProfilePicture = model.ProfilePicture;
            }

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest(updateResult.Errors);

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPut("ChangePassword")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("Password changed successfully");
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult> GetUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                profilePicture = user.ProfilePicture,
                isOnline = user.IsOnline
            });
        }
        
        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest(new { message = "User not found" });

            if (user.EmailConfirmationToken == model.Code)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
                return Ok(new { message = "Verification successful" });
            }

            return BadRequest(new { message = "Invalid verification code" });
        }
        
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest(new { message = "User not found" });

            user.EmailConfirmationToken = new Random().Next(100000, 999999).ToString();
            await _userManager.UpdateAsync(user);

            var subject = "Your password reset code";
            var body = $"<h1>Your reset code is: {user.EmailConfirmationToken}</h1>";
            await _emailService.SendEmailAsync(user.Email, subject, body);

            return Ok(new { message = "Password reset code sent", email = user.Email });
        }
        
        
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest(new { message = "User not found" });

            if (user.EmailConfirmationToken != model.Code)
                return BadRequest(new { message = "Invalid verification code" });

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, model.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password has been reset successfully" });
        }
        
    }
}
