export IG_CALLBACK_HOST="http://4bbd.localtunnel.com"
export IG_CLIENT_ID="87f4400b663c4c568ac2bd9a36b87b67"
export IG_CLIENT_SECRET="ace1dd176b674b75879a14d4fd175962"
alias sub_delete='curl -X DELETE  "https://api.instagram.com/v1/subscriptions?object=all&client_id=$IG_CLIENT_ID&client_secret=$IG_CLIENT_SECRET"'
alias sub_list='curl "https://api.instagram.com/v1/subscriptions?client_id=$IG_CLIENT_ID&client_secret=$IG_CLIENT_SECRET"'

alias sub_sunset='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=sunset"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/sunset/"      https://api.instagram.com/v1/subscriptions/'
alias sub_happyhour='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=happyhour"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/happyhour/"      https://api.instagram.com/v1/subscriptions/'
alias sub_dinner='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=dinner"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/dinner/"      https://api.instagram.com/v1/subscriptions/'
alias sub_kitty='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=kitty"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/kitty/"      https://api.instagram.com/v1/subscriptions/'
alias sub_goodnight='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=goodnight"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/goodnight/"      https://api.instagram.com/v1/subscriptions/'
alias sub_goodmorning='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=goodmorning"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/goodmorning/"      https://api.instagram.com/v1/subscriptions/'
alias sub_nyc='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=nyc"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/nyc/"      https://api.instagram.com/v1/subscriptions/'
alias sub_me='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=me"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/me/"      https://api.instagram.com/v1/subscriptions/'
alias sub_art='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=art"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/art/"      https://api.instagram.com/v1/subscriptions/'
alias sub_love='curl -F "client_id=$IG_CLIENT_ID"      -F "client_secret=$IG_CLIENT_SECRET"      -F "object=tag"      -F "aspect=media"      -F "object_id=love"      -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/love/"      https://api.instagram.com/v1/subscriptions/'


alias sub_nyc_geo='curl -F "client_id=$IG_CLIENT_ID"          -F "client_secret=$IG_CLIENT_SECRET"        -F "object=geography"         -F "aspect=media"          -F "lat=40.730869"          -F "lng=-73.994057"          -F "radius=5000"          -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/new-york-city/"          https://api.instagram.com/v1/subscriptions'
alias sub_tsquare_geo='curl -F "client_id=$IG_CLIENT_ID"          -F "client_secret=$IG_CLIENT_SECRET"        -F "object=geography"         -F "aspect=media"          -F "lat=40.759334"          -F "lng=-73.984444"          -F "radius=5000"          -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/times-square/"          https://api.instagram.com/v1/subscriptions'
alias sub_willy_geo='curl -F "client_id=$IG_CLIENT_ID"          -F "client_secret=$IG_CLIENT_SECRET"        -F "object=geography"         -F "aspect=media"          -F "lat=40.717631"          -F "lng=-73.958631"          -F "radius=5000"          -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/new-york-city/"          https://api.instagram.com/v1/subscriptions'

alias sub_all='sub_dinner && sub_kitty && sub_goodnight && sub_goodmorning && sub_nyc && sub_me && sub_art && sub_love && sub_sunset && sub_happyhour'
alias sub_all_geo='sub_nyc_geo && sub_willy_geo && sub_tsquare_geo'
