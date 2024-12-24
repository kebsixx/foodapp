alter table "public"."users" drop constraint "users_id_fkey";

alter table "public"."users" add column "address" text;

alter table "public"."users" add column "expo_notification_token" text;

alter table "public"."users" add column "gender" boolean;

alter table "public"."users" add column "name" text;

alter table "public"."users" add column "phone" bigint;

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrement_product_quantity(product_id bigint, quantity bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE product
  SET "maxQuantity" = "maxQuantity" = quantity
  where id = product_id AND "maxQuantity" >= quantity;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
 if new.raw_user_meta_data->>'avatar_url' is null or new.raw_user_meta_data->>'avatar_url' = '' then
  new.raw_user_meta_data = jsonb_set(new.raw_user_meta_data, '{avatar_url}', '"https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"' ::jsonb);
 end if;
 
 insert into public.users (
   id, 
   email, 
   avatar_url,
   name,
   address,
   phone,
   gender
 )
 values (
   new.id, 
   new.email, 
   new.raw_user_meta_data->>'avatar_url',
   new.raw_user_meta_data->>'name',
   new.raw_user_meta_data->>'address',
   new.raw_user_meta_data->>'phone',
   new.raw_user_meta_data->>'gender'
 );
 return new;
end;

$function$
;

create policy "Enable insert for authenticated users only"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for auth users"
on "public"."users"
as permissive
for update
to authenticated
using (true);



