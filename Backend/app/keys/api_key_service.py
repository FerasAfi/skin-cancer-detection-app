from app.database.supa import supabase


def log_api_usage(
    api_key_id: str,
    endpoint: str,
    status_code: int = 200,
    tokens_used: int = 0
):

    supabase.table("usage_logs").insert({
        "api_key_id": api_key_id,
        "endpoint": endpoint,
        "tokens_used": tokens_used,
        "status_code": status_code
    }).execute()


def count_month_usage(api_key_id: str):

    result = (
        supabase
        .table("usage_logs")
        .select("*", count="exact")
        .eq("api_key_id", api_key_id)
        .execute()
    )

    return result.count