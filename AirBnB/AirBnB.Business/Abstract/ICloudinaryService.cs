using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AirBnB.Business.Abstract
{
    public interface ICloudinaryService
    {
        Task<ImageUploadResult> UploadAsync(IFormFile file);
    }
}
