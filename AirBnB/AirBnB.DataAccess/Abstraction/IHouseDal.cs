using AirBnB.Core.DataAccess.EntityFramework;
using AirBnB.Entites.Concrete;


namespace AirBnB.DataAccess.Abstraction
{
    public interface IHouseDal:IEntityRepository<House>
    {
    }
}
