import Categories from "./Sections/categories";
import Cart from "./Sections/cart";
import {
  fetchRestaurantMenuForShopMenuWD,
  fetchRestaurantMenuWDWidget_multi,
  fetchShopDetails,
  fetchShopIdBySubdomain,
} from "@/lib/shopService";
import MenuList from "./Sections/menu-list";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import CategoryItem from "./Sections/Client/category-item";
import MenuLogo from "../Svgs/menu";
import { getSubdomainFromHeaders } from "@/lib/getSubdomain";
import MobileMenuFooter from "./Sections/Client/mobile-menu-footer";
// import CartBagLogo from "../Svgs/cart-bag";

export default async function MainMenuPage({
  mainMenu,
  menuId,
}: Readonly<{
  mainMenu: boolean;
  menuId?: string;
}>) {
  const subdomain = await getSubdomainFromHeaders();
  const shopId = await fetchShopIdBySubdomain(subdomain);
  const shopData = await fetchShopDetails(shopId);

  const parsedShopData =
    shopData && shopData.data ? JSON.parse(shopData.data) : null;

  let restaurantMenu;

  if (mainMenu) {
    restaurantMenu = await fetchRestaurantMenuWDWidget_multi(shopId);
  } else if (menuId) {
    restaurantMenu = await fetchRestaurantMenuForShopMenuWD(menuId);
  }

  const restaurantMenuList = restaurantMenu.data
    ? JSON.parse(restaurantMenu.data)
    : null;

  return (
    <>
      <div className="flex flex-col h-full">
        <section className="grid flex-1 h-full grid-cols-1 lg:grid-cols-8 grid-rows-1 gap-2 lg:px-6 px-3 py-4">
          <Categories
            className="col-span-2 hidden lg:block"
            restaurantMenu={restaurantMenu}
          />
          <MenuList
            className="col-span-4"
            menuList={restaurantMenu}
            shopData={shopData}
          />
          <Cart className="col-span-2 hidden lg:block" />
          <Popover>
            <div className="bottom-[72px] fixed justify-self-center">
              <PopoverTrigger asChild>
                <Button className="flex lg:hidden h-12 w-28 rounded-full">
                  <div className="h-full w-full place-items-center content-center">
                    <MenuLogo className="!w-6 !h-6" />
                  </div>
                  <span>Menu</span>
                </Button>
              </PopoverTrigger>
            </div>
            <PopoverContent className="w-72 h-[300px] overflow-auto border-0">
              <CategoryItem restaurantMenuList={restaurantMenuList} />
            </PopoverContent>
          </Popover>
          <div className="w-full fixed bottom-0 px-3 pb-2 left-0 gap-2 flex lg:hidden">
            {/* <Button
          className="bg-white text-primary flex h-12 flex-2/5"
          variant={"outline"}
        >
          <div>
            <CartBagLogo className={"fill-primary"} />
          </div>
          <div className="flex flex-col items-start">
            <span>View Cart</span>
            <span className="text-sm">$ 0.00</span>
          </div>
        </Button>
        <Button className="flex-3/5 h-12">Place Order</Button> */}
            <div className="bg-primary flex items-center justify-between w-full p-2 rounded-md">
              <MobileMenuFooter />
            </div>
          </div>
        </section>
        {/* <div className="h-10">
        <Footer />
      </div> */}
      </div>
    </>
  );
}
