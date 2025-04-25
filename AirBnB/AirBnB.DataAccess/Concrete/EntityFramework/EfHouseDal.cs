using AirBnB.Core.DataAccess.EntityFramework;
using AirBnB.DataAccess.Abstraction;
using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;

namespace AirBnB.DataAccess.Concrete.EntityFramework
{
    public class EfHouseDal:EfEntityRepositoryBase<House,AirBnbDbContext>,IHouseDal
    {
        public EfHouseDal(AirBnbDbContext context) : base(context)
        {
        }
    }
}
