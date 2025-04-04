import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import exportAsImage from "../utils/exportAsImage";
import { DownloadIcon } from "../icons/DownloadIcon";
import StarsIcon from "../icons/StarsIcon";
import RetryIcon from "../icons/RetryIcon";

const Main = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState("jeetsinghb");
  const [lastUser, setLastUser] = useState(null);

  const exportRef = useRef();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`https://api.github.com/users/${user}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error(
            "Username not found. Please enter a valid GitHub username.",
            {
              position: "top-center",
              style: {
                fontSize: "0.9rem",
                fontWeight: 400,
              },
            }
          );
          throw new Error("User not found");
        } else if (res.status === 403) {
          toast.error("Rate limit exceeded. Please wait and try again later.", {
            position: "top-center",
            style: {
              fontSize: "0.9rem",
              fontWeight: 400,
            },
          });
          throw new Error("Rate limit exceeded");
        }
        toast.error("Something went wrong. Please try again later.", {
          position: "top-center",
          style: {
            fontSize: "0.9rem",
            fontWeight: 400,
          },
        });
        throw new Error("Error: Something went wrong");
      }

      const data = await res.json();
      setProfile(data);
      setLastUser(user);
      toast.success("Profile loaded successfully!", {
        position: "top-center",
        style: {
          fontSize: "0.9rem",
          fontWeight: 400,
        },
      });
    } catch (error) {
      setError(error.message);
      setLastUser(null);
    } finally {
      setLoading(false);
    }
  };

  function handleSubmit(e) {
    e.preventDefault();

    const usernameRegex = /^[a-zA-Z0-9-]{1,39}$/;

    if (!user.trim()) {
      toast.error("Username is required", {
        position: "top-center",
        style: {
          fontSize: "0.9rem",
          fontWeight: 400,
        },
      });
      return;
    }

    if (!usernameRegex.test(user)) {
      toast.error(
        "Invalid username. Usernames can only contain letters, numbers, and hyphens (-).",
        {
          position: "top-center",
          style: { fontSize: "0.9rem", fontWeight: 400 },
        }
      );
      return;
    }

    if (user === lastUser) {
      toast("Hey! You're already viewing this profile.", {
        icon: "👀",
        position: "top-center",
        style: {
          fontSize: "0.9rem",
          fontWeight: 400,
        },
      });
      return;
    }

    fetchProfile();
  }

  useEffect(() => {
    if (user && user !== lastUser) {
      fetchProfile();
    }
  }, [lastUser]);

  return (
    <main className="py-12 max-w-[660px] mx-auto">
      <div className="container px-4 mx-auto flex flex-col md:flex-row items-center gap-y-6">
        <div className="w-full px-4">
          <div
            className="g_card max-w-[290px] mx-auto rounded-2xl overflow-hidden"
            ref={exportRef}
          >
            <div className="g_card_top text-center p-8">
              <div className="g_card_profile w-[120px] h-[120px] mx-auto mb-5">
                {loading || error ? (
                  <Skeleton circle height="100%" />
                ) : (
                  profile?.avatar_url && (
                    <img
                      loading="lazy"
                      src={profile?.avatar_url}
                      alt={profile?.name || "Profile Image"}
                      width="120"
                      height="120"
                      className="h-[120px] w-[120px] mx-auto object-cover g_profile"
                    />
                  )
                )}
              </div>
              {loading || error ? (
                <Skeleton />
              ) : (
                <h3 className="mb-1 text-[#6c6a6a] font-medium">
                  {profile?.name}
                </h3>
              )}
              {loading || error ? (
                <Skeleton />
              ) : (
                <h4 className="mb-3 uppercase text-sm">{profile?.location}</h4>
              )}
              {loading || error ? (
                <Skeleton />
              ) : (
                <p className="text-sm">{profile?.bio}</p>
              )}
              <ul className="flex justify-between border-t border-[#f3f3f3] pt-4 px-2 mt-5">
                <li className="text-sm">
                  <span className="block mb-1">Followers</span>
                  {loading || error ? <Skeleton /> : profile?.followers || 0}
                </li>
                <li className="text-sm">
                  <span className="block mb-1">Repo</span>
                  {loading || error ? <Skeleton /> : profile?.public_repos || 0}
                </li>
                <li className="text-sm">
                  <span className="block mb-1">Following</span>
                  {loading || error ? <Skeleton /> : profile?.following || 0}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full px-4">
          <span className="block mx-auto label text-center mb-4">
            Enter Username 👇
          </span>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-w-[290px] mx-auto pb-5"
          >
            <input
              disabled={loading && true}
              type="text"
              name="user"
              value={user}
              onChange={(e) => setUser(e.target.value.trim().toLowerCase())}
              className="border-b input text-center p-1 focus:outline-0"
              placeholder="Enter GitHub username"
              autoComplete="off"
              aria-label="Enter GitHub username"
              autoFocus
            />
            <button
              disabled={loading}
              aria-label="Generate profile card"
              type="submit"
              className={`btn-filled flex justify-center items-center gap-1 mt-6 border-2 border-[#222222] bg-[#222222] hover:bg-[#333333] text-white px-2 py-3 transition ${
                loading
                  ? "!cursor-not-allowed opacity-70"
                  : error
                  ? "bg-red-700 border-white text-white hover:bg-red-600 btn-filled-error"
                  : ""
              }`}
            >
              {loading ? (
                "Loading..."
              ) : error ? (
                <>
                  Retry
                  <RetryIcon />
                </>
              ) : (
                <>
                  Generate
                  <StarsIcon className="fill-current mt-[-3px]" />
                </>
              )}
            </button>
          </form>
          <button
            onClick={() => exportAsImage(exportRef.current, "profile")}
            disabled={loading || !user || !lastUser || (error && true)}
            aria-label="Download profile card"
            className={`btn-outlined flex justify-center items-center gap-1 w-full max-w-[290px] mx-auto border-2 border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white px-2 py-3 transition ${
              loading || error || !user || !lastUser
                ? "!cursor-not-allowed opacity-70"
                : ""
            }`}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Download <DownloadIcon className="fill-current mt-[-3px]" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Main;
