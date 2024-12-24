drop policy "Enable insert for authenticated users only" on "public"."users";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
 if new.raw_user_meta_data->>'avatar_url' is null or new.raw_user_meta_data->>'avatar_url' = '' then
  new.raw_user_meta_data = jsonb_set(new.raw_user_meta_data, '{avatar_url}', '"https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"' ::jsonb);
 end if;
 
 insert into "public"."users" (
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

create policy "Enable insert for users"
on "public"."users"
as permissive
for insert
to public
with check (true);


create policy "Enable public signup"
on "public"."users"
as permissive
for insert
to public
with check (true);



